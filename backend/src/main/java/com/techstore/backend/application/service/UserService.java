package com.techstore.backend.application.service;

import com.techstore.backend.application.dto.user.ClerkWebhookUserRequest;
import com.techstore.backend.application.dto.user.UserResponse;

/**
 * Kullanıcı İş Mantığı Arayüzü (Service Interface).
 *
 * NEDEN INTERFACE?
 * Clean Architecture'da iş mantığı somut sınıfa değil, soyutlamaya bağlanır.
 * Bu yaklaşımın faydaları:
 *   1. Test edilebilirlik: @MockBean veya Mockito ile kolayca mock'lanır.
 *   2. Değiştirilebilirlik: UserServiceImpl yerine başka bir implementasyon
 *      eklenebilir (örn. caching decorator).
 *   3. Bağımlılık tersine çevirme (DIP): Controller sadece bu interface'i
 *      tanır; implementasyon değişse Controller etkilenmez.
 *
 * Clerk Webhook Entegrasyon Akışı:
 *   user.created → upsertUserFromClerk() → yeni kayıt oluştur
 *   user.updated → upsertUserFromClerk() → mevcut kaydı güncelle
 *   user.deleted → deactivateUser()      → soft delete (isActive = false)
 */
public interface UserService {

    /**
     * Clerk'ten gelen kullanıcı verisini veritabanına yansıtır.
     *
     * "Upsert" (Update or Insert) mantığı:
     *   - Eğer clerk_id ile eşleşen bir kayıt YOKSA → yeni kullanıcı oluşturur.
     *   - Eğer clerk_id ile eşleşen bir kayıt VARSA → mevcut kaydı günceller.
     *
     * Bu tek metod hem "user.created" hem "user.updated" webhook event'lerini
     * karşılar. İdempotent yapıda olduğu için aynı webhook birden fazla
     * gelirse mükerrer kayıt oluşmaz.
     *
     * @param request Clerk'ten gelen kullanıcı verisi
     * @return Oluşturulan veya güncellenen kullanıcının DTO'su
     */
    UserResponse upsertUserFromClerk(ClerkWebhookUserRequest request);

    /**
     * Clerk'teki kullanıcı ID'si (clerk_id) ile yerel kullanıcıyı getirir.
     *
     * @param clerkId Clerk platformundaki kullanıcı kimliği
     * @return Bulunan kullanıcının DTO'su
     * @throws com.techstore.backend.domain.exception.EntityNotFoundException
     *         Belirtilen clerk_id ile aktif kullanıcı bulunamazsa
     */
    UserResponse getUserByClerkId(String clerkId);

    /**
     * Clerk "user.deleted" webhook event'ini işler; kullanıcıyı soft delete yapar.
     *
     * Fiziksel silme yapılmaz; isActive = false yapılır.
     * Bu sayede kullanıcının geçmiş siparişleri ve ilişkili verileri korunur.
     *
     * @param clerkId Silinecek kullanıcının Clerk ID'si
     * @throws com.techstore.backend.domain.exception.EntityNotFoundException
     *         Belirtilen clerk_id ile kullanıcı bulunamazsa
     */
    void deactivateUser(String clerkId);
}
