package com.techstore.backend.api.controller;

import com.techstore.backend.application.dto.user.ClerkWebhookUserRequest;
import com.techstore.backend.application.dto.user.UserResponse;
import com.techstore.backend.application.dto.webhook.ClerkWebhookEvent;
import com.techstore.backend.application.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Kullanıcı ve Clerk Webhook REST Controller.
 *
 * SORUMLULUKLAR:
 *   1. Clerk webhook event'lerini karşılamak (user.created, user.updated, user.deleted)
 *   2. Kimliği doğrulanmış kullanıcının kendi profilini okuması
 *
 * WEBHOOK GÜVENLİĞİ:
 * Clerk, webhook isteklerini Svix kütüphanesi ile imzalar.
 * Her istek şu başlıkları içerir:
 *   svix-id, svix-timestamp, svix-signature
 *
 * Gerçek bir üretim ortamında bu imzaların DOĞRULANMASI KRİTİKTİR.
 * Aksi hâlde herhangi biri bu endpoint'e istek atarak sahte kullanıcı
 * oluşturabilir. İmza doğrulaması şu an yorumlanmış (commented-out) durumda
 * bırakılmıştır; Svix bağımlılığı eklendikten sonra aktif edilecektir.
 *
 * Şimdilik güvenlik katmanı olarak:
 *   - Bu endpoint SecurityConfig'te "permitAll" DEĞİL "authenticated" olarak
 *     bırakılmıştır. Yani yalnızca geçerli JWT token ile erişilebilir.
 *   - Svix imza doğrulaması ilerideki adımda eklenecektir.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // =========================================================================
    // CLERK WEBHOOK ENDPOİNT'İ
    // =========================================================================

    /**
     * POST /api/v1/webhooks/clerk
     * Clerk'ten gelen tüm kullanıcı lifecycle event'lerini işler.
     *
     * CLERK EVENT TİPLERİ VE İŞLEM MANTIĞI:
     *   "user.created" → upsertUserFromClerk(): Yeni kullanıcı kaydı oluşturur
     *   "user.updated" → upsertUserFromClerk(): Mevcut kaydı günceller
     *   "user.deleted" → deactivateUser():      Soft delete (isActive = false)
     *
     * TEK ENDPOİNT YAKLAŞIMI:
     * Tüm event tipleri tek endpoint'te karşılanır ve type alanına göre
     * yönlendirme yapılır. Bu, Clerk Dashboard'da tek bir Webhook URL
     * tanımlanmasına olanak tanır; yönetimi kolaylaştırır.
     *
     * HTTP 200 DÖNME ZORUNLULUĞU:
     * Clerk, webhook endpoint'ten 2xx yanıt almazsa isteği tekrar gönderir
     * (exponential backoff ile). Bu nedenle hata olsa bile 200 dönmek
     * yerine gerçek hataları GlobalExceptionHandler'a bırakıyoruz.
     *
     * @param event Clerk'ten gelen JSON payload (ClerkWebhookEvent DTO'suna parse edilir)
     * @return 200 OK veya hata durumunda GlobalExceptionHandler'dan gelen hata yanıtı
     */
    @PostMapping("/webhooks/clerk")
    public ResponseEntity<Void> handleClerkWebhook(@RequestBody ClerkWebhookEvent event) {
        log.info("[UserController] Clerk webhook alındı. type={}", event.type());

        // ÖNEMLİ: Burada Svix imza doğrulaması yapılacak (ilerideki adım)
        // verifyWebhookSignature(svixId, svixTimestamp, svixSignature, rawBody);

        // Event tipine göre doğru iş mantığını çağır
        switch (event.type()) {

            case "user.created", "user.updated" -> {
                // Kullanıcı oluşturma veya güncelleme: Webhook verisini ClerkWebhookUserRequest'e dönüştür
                ClerkWebhookUserRequest request = mapToUserRequest(event);
                userService.upsertUserFromClerk(request);
                log.info("[UserController] Kullanıcı upsert tamamlandı. clerkId={}", event.data().id());
            }

            case "user.deleted" -> {
                // Kullanıcı silme: Sadece clerkId yeterli
                String clerkId = event.data().id();
                userService.deactivateUser(clerkId);
                log.info("[UserController] Kullanıcı deaktive edildi. clerkId={}", clerkId);
            }

            default ->
                // Bilinmeyen event tipi: Logla ve 200 ile geç
                // (Clerk ileride yeni tipler ekleyebilir; uygulamayı çökertme)
                log.warn("[UserController] Bilinmeyen Clerk event tipi: {}. Atlandı.", event.type());
        }

        // Clerk başarılı işlemi 204 No Content ile onaylıyoruz
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // KİMLİĞİ DOĞRULANMIŞ KULLANICI ENDPOİNT'LERİ
    // =========================================================================

    /**
     * GET /api/v1/users/me
     * Kimliği doğrulanmış kullanıcının kendi profil bilgisini döndürür.
     *
     * JWT token'dan clerk_id çıkarımı şu an header üzerinden yapılır;
     * ilerideki Security adımında @AuthenticationPrincipal ile Spring Security
     * context'inden otomatik olarak alınacaktır.
     *
     * Güvenlik: Bu endpoint SecurityConfig'te "authenticated" olarak korunur.
     * JWT token olmadan erişim → 401 Unauthorized döner.
     *
     * @param clerkId Request header'dan gelen Clerk kullanıcı ID'si
     *                (geliştirme aşaması; production'da JWT claim'den okunacak)
     * @return 200 OK — UserResponse DTO'su
     */
    @GetMapping("/users/me")
    public ResponseEntity<UserResponse> getMyProfile(
            @RequestHeader("X-Clerk-User-Id") String clerkId
    ) {
        log.debug("[UserController] Profil bilgisi isteniyor. clerkId={}", clerkId);
        return ResponseEntity.ok(userService.getUserByClerkId(clerkId));
    }

    // =========================================================================
    // YARDIMCI METODLAR
    // =========================================================================

    /**
     * ClerkWebhookEvent → ClerkWebhookUserRequest dönüşümü.
     *
     * Clerk'in karmaşık webhook yapısından (iç içe listeler vb.)
     * Service katmanının beklediği düz DTO'ya veri çıkarılır.
     *
     * primaryEmail() ve primaryPhone(): ClerkWebhookEvent içindeki
     * yardımcı metodlar liste başını null-safe şekilde döndürür.
     *
     * @param event Ham webhook event nesnesi
     * @return Service katmanı için hazırlanmış kullanıcı isteği DTO'su
     */
    private ClerkWebhookUserRequest mapToUserRequest(ClerkWebhookEvent event) {
        ClerkWebhookEvent.UserData data = event.data();
        return new ClerkWebhookUserRequest(
                data.id(),
                data.primaryEmail(),
                data.firstName(),
                data.lastName(),
                data.imageUrl(),
                data.primaryPhone()
        );
    }
}
