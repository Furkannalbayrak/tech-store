package com.techstore.backend.application.dto.user;

import java.time.Instant;
import java.util.UUID;

/**
 * Kullanıcı Yanıt DTO'su — API'den dışarıya dönen kullanıcı verisi.
 *
 * NEDEN AYRI BİR RESPONSE DTO?
 * Entity sınıfı (User.java) doğrudan dönülürse:
 *   - JPA proxy nesneleri JSON'a serialize edilirken hata çıkabilir.
 *   - Gelecekte Entity'ye eklenen yeni alanlar (örn. hassas iç alanlar)
 *     yanlışlıkla dışarıya sızabilir.
 *   - API sözleşmesi (contract) Entity şemasına bağımlı hale gelir;
 *     Entity değişince API de bozulur.
 *
 * Bu DTO yalnızca önyüze (Next.js) gösterilmesi uygun alanları içerir.
 * Hassas veya iç kullanıma özel alanlar (örn. embedding gibi ilerideki alanlar)
 * buraya eklenmez.
 *
 * @param id              Kullanıcının UUID birincil anahtarı
 * @param clerkId         Clerk kimlik doğrulama sistemiyle eşleşme ID'si
 * @param email           E-posta adresi
 * @param firstName       Ad
 * @param lastName        Soyad
 * @param profileImageUrl Profil fotoğrafı URL'si
 * @param phoneNumber     Telefon numarası
 * @param isActive        Hesabın aktif olup olmadığı (soft delete durumu)
 * @param createdAt       Kaydın oluşturulma zamanı (UTC)
 * @param updatedAt       Son güncelleme zamanı (UTC)
 */
public record UserResponse(
        UUID    id,
        String  clerkId,
        String  email,
        String  firstName,
        String  lastName,
        String  profileImageUrl,
        String  phoneNumber,
        Boolean isActive,
        Instant createdAt,
        Instant updatedAt
) {}
