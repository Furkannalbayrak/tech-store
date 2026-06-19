package com.techstore.backend.application.service.impl;

import com.techstore.backend.application.dto.user.ClerkWebhookUserRequest;
import com.techstore.backend.application.dto.user.UserResponse;
import com.techstore.backend.application.mapper.UserMapper;
import com.techstore.backend.application.service.UserService;
import com.techstore.backend.domain.entity.User;
import com.techstore.backend.domain.exception.EntityNotFoundException;
import com.techstore.backend.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * UserService implementasyonu — Kullanıcı iş mantığı.
 *
 * @Slf4j     : Lombok ile SLF4J logger otomatik oluşturulur (log.info, log.warn vb.)
 * @Service   : Spring'e bu sınıfın bir servis bean'i olduğunu bildirir.
 * @RequiredArgsConstructor: Lombok, final alanlar için constructor injection üretir.
 *              @Autowired yerine constructor injection tercih edilir; bu yaklaşım:
 *              - Test sınıflarında mock enjeksiyonunu kolaylaştırır.
 *              - Döngüsel bağımlılıkları (circular dependency) derleme zamanında yakalar.
 *              - Immutability (değiştirilemezlik) garantisi sağlar.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    // Repository ve Mapper'lar constructor injection ile alınır (final → zorunlu inject)
    private final UserRepository userRepository;
    private final UserMapper     userMapper;

    /**
     * Clerk Webhook Upsert — Kullanıcı oluştur veya güncelle.
     *
     * UPSERT MANTIĞI:
     *   1. clerk_id ile veritabanında kayıt ara (aktif veya pasif, fark etmez).
     *   2. Kayıt YOKSA → yeni User entity oluştur, kaydet.
     *   3. Kayıt VARSA → mevcut entity'yi güncelle (partial update).
     *
     * @Transactional: Metodun tamamı tek bir veritabanı işlemi (transaction) içinde
     * çalışır. Hata olursa tüm değişiklikler geri alınır (rollback).
     * Bu, veri tutarsızlığını önleyen kritik bir mekanizmadır.
     *
     * İDEMPOTENSY:
     * Clerk bazen aynı webhook'u birden fazla gönderebilir (retry mekanizması).
     * Bu metod her çağrıda aynı sonucu üretir; mükerrer kayıt oluşmaz.
     */
    @Override
    @Transactional
    public UserResponse upsertUserFromClerk(ClerkWebhookUserRequest request) {
        log.info("[UserService] Upsert isteği alındı. clerkId={}", request.clerkId());

        // Veritabanında clerk_id'ye göre mevcut kaydı ara (durum fark etmeksizin)
        return userRepository.findByClerkIdRegardlessOfStatus(request.clerkId())
                .map(existingUser -> {
                    // GÜNCELLEME YOLU: Mevcut kayıt bulundu → alanları güncelle
                    log.info("[UserService] Mevcut kullanıcı güncelleniyor. clerkId={}", request.clerkId());
                    userMapper.updateEntityFromRequest(existingUser, request);
                    User updatedUser = userRepository.save(existingUser);
                    return userMapper.toResponse(updatedUser);
                })
                .orElseGet(() -> {
                    // OLUŞTURMA YOLU: Kayıt bulunamadı → yeni kullanıcı oluştur
                    log.info("[UserService] Yeni kullanıcı oluşturuluyor. clerkId={}", request.clerkId());
                    User newUser = userMapper.toEntity(request);
                    User savedUser = userRepository.save(newUser);
                    return userMapper.toResponse(savedUser);
                });
    }

    /**
     * clerk_id ile aktif kullanıcıyı getirir.
     *
     * @Transactional(readOnly = true):
     *   - readOnly = true → JPA'nın dirty checking mekanizmasını devre dışı bırakır.
     *   - Bu, okuma işlemlerinde bellek ve CPU kullanımını azaltır.
     *   - Bazı veritabanı sürücüleri bu ipucuyla read replica'ya yönlendirebilir.
     */
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByClerkId(String clerkId) {
        log.debug("[UserService] Kullanıcı aranıyor. clerkId={}", clerkId);

        // Aktif kullanıcıyı bul; yoksa anlamlı hata mesajıyla EntityNotFoundException fırlat
        User user = userRepository.findByClerkIdAndIsActiveTrue(clerkId)
                .orElseThrow(() -> {
                    log.warn("[UserService] Aktif kullanıcı bulunamadı. clerkId={}", clerkId);
                    return new EntityNotFoundException("Kullanıcı bulunamadı: " + clerkId);
                });

        return userMapper.toResponse(user);
    }

    /**
     * Clerk "user.deleted" webhook event'i — Soft Delete işlemi.
     *
     * Fiziksel silme yapılmaz. isActive = false yapılarak kayıt "pasifleştirilir".
     * Bu sayede:
     *   - Kullanıcının geçmiş siparişleri ve ilişkili kayıtları korunur.
     *   - GDPR gereği veri silme talep edilmişse ayrı bir "anonymize" adımı gerekir.
     *   - Hesap yanlışlıkla silinmişse admin tarafından kolayca geri açılabilir.
     */
    @Override
    @Transactional
    public void deactivateUser(String clerkId) {
        log.info("[UserService] Kullanıcı deaktive ediliyor. clerkId={}", clerkId);

        // Durum fark etmeksizin kaydı bul (zaten pasif olabilir)
        User user = userRepository.findByClerkIdRegardlessOfStatus(clerkId)
                .orElseThrow(() -> {
                    log.warn("[UserService] Deaktive edilecek kullanıcı bulunamadı. clerkId={}", clerkId);
                    return new EntityNotFoundException("Silinecek kullanıcı bulunamadı: " + clerkId);
                });

        // Soft delete: Fiziksel silme yok, sadece bayrak güncelleniyor
        user.setIsActive(false);
        userRepository.save(user);

        log.info("[UserService] Kullanıcı başarıyla deaktive edildi. clerkId={}", clerkId);
    }
}
