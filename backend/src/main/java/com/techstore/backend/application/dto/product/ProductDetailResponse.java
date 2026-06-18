package com.techstore.backend.application.dto.product;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Ürün Detay Yanıt DTO'su — Tek ürün sayfasında kullanılır.
 *
 * Ürün detay sayfasına özel olarak TÜM alanları içerir:
 *   - description (tam açıklama)
 *   - attributes  (JSONB teknik özellikler haritası)
 *   - imageUrls   (tüm görsel listesi, galeri için)
 *
 * embedding vektörü buraya DAHİL EDİLMEZ; bu sadece iç AI sorgulama için
 * kullanılan bir veri alanıdır ve dışarıya sızdırılmamalıdır.
 *
 * Kullanım: GET /api/products/{slug}
 *
 * @param id               UUID birincil anahtar
 * @param name             Ürün adı
 * @param slug             SEO uyumlu URL parçası
 * @param shortDescription Kısa açıklama
 * @param description      Tam açıklama (Markdown destekli olabilir)
 * @param price            Normal satış fiyatı
 * @param discountedPrice  İndirimli fiyat (null ise kampanya yoktur)
 * @param brand            Marka
 * @param category         Kategori
 * @param stockQuantity    Stok miktarı
 * @param imageUrls        Tüm görsel URL listesi (galeri için)
 * @param attributes       JSONB teknik özellikler (key-value haritası)
 * @param isFeatured       Öne çıkan ürün mü?
 * @param isActive         Ürün aktif mi? (soft delete durumu)
 * @param createdAt        Oluşturulma zamanı
 * @param updatedAt        Son güncelleme zamanı
 */
public record ProductDetailResponse(
        UUID                id,
        String              name,
        String              slug,
        String              shortDescription,
        String              description,
        BigDecimal          price,
        BigDecimal          discountedPrice,
        String              brand,
        String              category,
        Integer             stockQuantity,
        List<String>        imageUrls,
        Map<String, Object> attributes,
        Boolean             isFeatured,
        Boolean             isActive,
        Instant             createdAt,
        Instant             updatedAt
) {}
