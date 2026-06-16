package com.techstore.backend.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA Auditing Konfigürasyonu.
 *
 * @EnableJpaAuditing: Spring Data JPA'nın auditing mekanizmasını aktif eder.
 * Bu anotasyon olmadan BaseEntity'deki @CreatedDate ve @LastModifiedDate
 * anotasyonları çalışmaz; alanlar NULL kalır.
 *
 * Çalışma prensibi:
 *   1. Bir Entity ilk kez persist() edildiğinde:
 *      → createdAt = Instant.now() (Spring tarafından otomatik set edilir)
 *      → updatedAt = Instant.now()
 *
 *   2. Bir Entity merge() (güncelleme) edildiğinde:
 *      → createdAt değişmez (updatable = false sayesinde)
 *      → updatedAt = Instant.now() (otomatik yenilenir)
 *
 * Bu konfigürasyonu ana Application sınıfına @EnableJpaAuditing ekleyerek
 * de yapabilirdik; ancak ayrı bir @Configuration sınıfında tutmak
 * Single Responsibility Principle'a uygundur ve test edilebilirliği artırır.
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
    // Bean tanımlamaya gerek yok; sadece @EnableJpaAuditing yeterlidir.
    // Kullanıcı bazlı auditing (createdBy/modifiedBy) gerekirse
    // AuditorAware<UUID> bean'i bu sınıfa eklenebilir.
}
