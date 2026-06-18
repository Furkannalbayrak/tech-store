package com.techstore.backend.application.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Clerk Webhook İstek DTO'su — Kullanıcı Oluşturma / Güncelleme.
 *
 * Clerk'in "user.created" ve "user.updated" webhook event'lerinden
 * gelen veriyi taşır. Controller bu DTO'yu alır, Service iş mantığını
 * uygular; Entity asla doğrudan dışarıya açılmaz.
 *
 * Java Record kullanımının avantajları:
 *   - İmmutable (değiştirilemez): Verinin yanlışlıkla mutasyona uğraması önlenir.
 *   - Otomatik: equals(), hashCode(), toString() ve constructor üretilir.
 *   - Lombok gerektirmez: Daha az bağımlılık.
 *
 * @param clerkId         Clerk'teki benzersiz kullanıcı ID'si (zorunlu)
 * @param email           Kullanıcının birincil e-posta adresi (zorunlu, format kontrolü)
 * @param firstName       Ad (opsiyonel, Clerk profilinden alınır)
 * @param lastName        Soyad (opsiyonel)
 * @param profileImageUrl Profil fotoğrafı URL'si (opsiyonel)
 * @param phoneNumber     Telefon numarası (opsiyonel)
 */
public record ClerkWebhookUserRequest(

        @NotBlank(message = "Clerk ID boş olamaz")
        String clerkId,

        @NotBlank(message = "E-posta adresi boş olamaz")
        @Email(message = "Geçerli bir e-posta adresi giriniz")
        String email,

        String firstName,

        String lastName,

        @Size(max = 2048, message = "Profil fotoğrafı URL'si 2048 karakteri geçemez")
        String profileImageUrl,

        @Size(max = 20, message = "Telefon numarası 20 karakteri geçemez")
        String phoneNumber
) {}
