package com.techstore.backend.domain.entity;

import com.techstore.backend.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Kullanıcı (User) Entity sınıfı.
 *
 * Bu sınıf, Clerk üzerinden kimliği doğrulanmış kullanıcıları
 * yerel veritabanında temsil eder. Kimlik doğrulama (authentication)
 * tamamen Clerk'e devredildiği için:
 *   - Şifre (password) kolonu YOKTUR.
 *   - Kullanıcı eşleşmesi clerk_id üzerinden yapılır.
 *
 * Lombok Anotasyonları:
 *   @Getter  → Tüm alanlar için getter metodları üretir.
 *   @Setter  → Tüm alanlar için setter metodları üretir.
 *   @Builder → Builder pattern ile nesne oluşturmayı sağlar.
 *   @NoArgsConstructor → JPA'nın gerektirdiği parametresiz constructor'ı üretir.
 *   @AllArgsConstructor → @Builder'ın çalışabilmesi için tüm parametreli constructor'ı üretir.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "users",
    // Sık sorgulanan kolonlar için veritabanı düzeyinde index tanımları.
    // Bu tanımlar Hibernate schema validation'da da kullanılır.
    indexes = {
        @Index(name = "idx_users_clerk_id", columnList = "clerk_id"),
        @Index(name = "idx_users_email",    columnList = "email"),
        @Index(name = "idx_users_active",   columnList = "is_active")
    }
)
public class User extends BaseEntity {

    /**
     * Clerk platformundaki kullanıcının benzersiz kimliği.
     * Format: "user_2aBcDeFgH..." (Clerk tarafından atanır)
     *
     * Webhook geldiğinde veya JWT parse edildiğinde bu değer kullanılarak
     * yerel kullanıcı kaydı bulunur (veya yeni kayıt oluşturulur).
     * unique = true: Aynı Clerk kullanıcısı iki kez kaydedilemez.
     */
    @Column(name = "clerk_id", nullable = false, unique = true, length = 255)
    private String clerkId;

    /**
     * Kullanıcının e-posta adresi.
     * Clerk'teki birincil e-posta ile senkronize tutulur.
     * unique = true: Aynı e-posta iki farklı kullanıcıya atanamaz.
     */
    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    /**
     * Kullanıcının adı (Clerk'teki first_name ile senkronize edilir).
     */
    @Column(name = "first_name", length = 100)
    private String firstName;

    /**
     * Kullanıcının soyadı (Clerk'teki last_name ile senkronize edilir).
     */
    @Column(name = "last_name", length = 100)
    private String lastName;

    /**
     * Kullanıcının profil fotoğrafının URL'si.
     * Clerk'teki image_url alanından alınır.
     * Uzun URL'ler olabileceğinden columnDefinition = "TEXT" kullanılır.
     */
    @Column(name = "profile_image_url", columnDefinition = "TEXT")
    private String profileImageUrl;

    /**
     * Kullanıcının telefon numarası (opsiyonel).
     * Kullanıcı sonradan profil sayfasından ekleyebilir.
     */
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    /**
     * Soft Delete bayrağı.
     * false → Kullanıcı "silinmiş" kabul edilir ama kayıt veritabanında kalır.
     * true  → Kullanıcı aktif ve sisteme erişebilir.
     *
     * Kullanıcı hesabı kapatıldığında bu değer false yapılır;
     * böylece geçmiş siparişler ve ilişkili veriler korunur.
     */
    @Builder.Default // @Builder ile birlikte default değerin korunmasını sağlar
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
