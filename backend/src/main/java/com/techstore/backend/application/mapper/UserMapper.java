package com.techstore.backend.application.mapper;

import com.techstore.backend.application.dto.user.ClerkWebhookUserRequest;
import com.techstore.backend.application.dto.user.UserResponse;
import com.techstore.backend.domain.entity.User;
import org.springframework.stereotype.Component;

/**
 * User Entity ↔ DTO dönüşüm sınıfı.
 *
 * NEDEN MAPPER?
 * Service katmanı iş mantığına odaklanmalıdır; dönüşüm kodları
 * ayrı bir sınıfta tutulursa:
 *   1. Tek Sorumluluk Prensibi (SRP) korunur.
 *   2. Mapper'ı bağımsız olarak test etmek mümkün olur.
 *   3. MapStruct gibi bir kütüphaneye geçiş kolaylaşır.
 *
 * Manuel mapper kullanımının avantajı:
 *   - Derleme zamanında tip güvenliği.
 *   - Harici kütüphane bağımlılığı olmadan şeffaf dönüşüm.
 *   - Hata ayıklaması kolay.
 *
 * @Component: Spring context'e bean olarak kaydedilir;
 * Service katmanında @Autowired / constructor injection ile kullanılır.
 */

/**
 * public User toEntity(ClerkWebhookUserRequest request) {
    // Hangisi email, hangisi isim, hangisi soyisim? Karışabilir!
    return new User(
        request.clerkId(), 
        request.email(), 
        request.firstName(), 
        request.lastName(), 
        request.profileImageUrl(), 
        request.phoneNumber(),
        null, // createdAt (sonradan eklenecek)
        null, // updatedAt
        null  // id vb...
    );
}
böyle yapınca sırayla yazmamız gerektiği için hata yapılabilir ayrıca olmayan değerlere null yazmalıyız
ancak builder ile Sadece ihtiyacımız olan 5 tanesini doldurup .build() diyebiliriz.
Geri kalanlara otomatik null veya varsayılan değer atanır
 */


@Component
public class UserMapper {

    /**
     * Clerk Webhook Request DTO → User Entity dönüşümü.
     *
     * Yeni kullanıcı oluşturma senaryosunda kullanılır.
     * id, createdAt, updatedAt → BaseEntity ve JPA Auditing tarafından doldurulur.
     * isActive → Entity'de @Builder.Default ile true olarak ayarlanmıştır.
     *
     * @param request Clerk'ten gelen webhook verisi
     * @return Persist edilmeye hazır User entity nesnesi
     */
    public User toEntity(ClerkWebhookUserRequest request) {
        return User.builder()
                .clerkId(request.clerkId())
                .email(request.email())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .profileImageUrl(request.profileImageUrl())
                .phoneNumber(request.phoneNumber())
                // isActive default olarak true gelir; burada açıkça setlemeye gerek yoktur
                .build();
    }

    /**
     * User Entity → UserResponse DTO dönüşümü.
     *
     * Önyüze (Next.js) dönülecek güvenli veri seti oluşturulur.
     * Entity'deki embedding veya iç alanlar bu dönüşüme dahil edilmez.
     *
     * @param user Veritabanından gelen User entity nesnesi
     * @return Önyüze gönderilecek UserResponse DTO'su
     */
    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getClerkId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getProfileImageUrl(),
                user.getPhoneNumber(),
                user.getIsActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }


    /**
     * Mevcut User Entity'yi webhook güncelleme verisiyle doldurur (partial update).
     *
     * Clerk "user.updated" event'inde bazı alanlar null gelebilir
     * (örn. kullanıcı sadece adını değiştirdiyse email null gelir).
     * Bu durumda mevcut değer korunur; sadece null olmayan alanlar güncellenir.
     *
     * @param existingUser Veritabanındaki mevcut User kaydı (mutate edilecek)
     * @param request      Clerk'ten gelen güncelleme verisi
     */
    public void updateEntityFromRequest(User existingUser, ClerkWebhookUserRequest request) {
        // Null guard: Gelen değer null değilse güncelle, null ise mevcut değeri koru
        if (request.email() != null)           existingUser.setEmail(request.email());
        if (request.firstName() != null)       existingUser.setFirstName(request.firstName());
        if (request.lastName() != null)        existingUser.setLastName(request.lastName());
        if (request.profileImageUrl() != null) existingUser.setProfileImageUrl(request.profileImageUrl());
        if (request.phoneNumber() != null)     existingUser.setPhoneNumber(request.phoneNumber());
        // clerkId ve isActive güncelleme sırasında değiştirilmez
    }
}
