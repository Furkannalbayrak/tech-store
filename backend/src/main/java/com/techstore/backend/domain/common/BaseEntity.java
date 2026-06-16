package com.techstore.backend.domain.common;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Tüm Entity sınıflarının kalıtım alacağı temel (base) sınıf.
 *
 * Bu abstract sınıf, projedeki tüm tablolarda ortak olan alanları
 * tek bir yerde toplar (DRY prensibi):
 *   - id (UUID birincil anahtar)
 *   - created_at / updated_at (auditing)
 *
 * @MappedSuperclass: Bu sınıf için ayrı bir tablo oluşturulmaz;
 * sadece alt sınıfların tablolarına bu kolonlar eklenir.
 *
 * @EntityListeners(AuditingEntityListener.class): Spring JPA Auditing
 * mekanizmasını devreye sokar. Bu sayede @CreatedDate ve @LastModifiedDate
 * anotasyonları otomatik olarak dolar.
 */
@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    /**
     * Birincil anahtar: UUID tipinde.
     *
     * @GeneratedValue strategy = AUTO: JPA, hangi UUID üretici stratejisini
     * kullanacağına karar verir. PostgreSQL için gen_random_uuid() eşdeğerini
     * kullanmak üzere strategy'yi UUID olarak belirtiyoruz (Hibernate 6+ ile gelir).
     * Bu sayede kimlik çakışması riski ortadan kalkar ve ID tahmin edilemez olur.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    /**
     * Kaydın ilk oluşturulma zamanı (UTC).
     *
     * @CreatedDate: Spring Auditing bu alanı kaydın ilk persist edildiği anda
     * otomatik doldurur. updatable = false ile bir daha değişmesini engelliyoruz.
     * Instant tipi, zaman diliminden bağımsız UTC an'ı temsil eder.
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * Kaydın son güncellenme zamanı (UTC).
     *
     * @LastModifiedDate: Spring Auditing her güncellemede bu alanı otomatik yeniler.
     * Veritabanı tarafındaki trigger ile birlikte çift güvenlik sağlar.
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
