package com.techstore.backend.application.dto.product;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.Instant;

/**
 * Ürün Özet Yanıt DTO'su — Liste sayfalarında kullanılır.
 *
 * Tam ürün detayı yerine liste kartlarına yetecek kadar bilgi taşır.
 * Bu sayede:
 *   - Ağ trafiği azalır (description ve attributes gibi büyük alanlar gelmez).
 *   - Frontend liste render performansı artar.
 *   - Yalnızca birinci görsel (imageUrls'in ilk elemanı) döndürülür.
 *
 * Kullanım: GET /api/products (ürün listesi sayfalama yanıtı)
 *
 * @param id               UUID birincil anahtar
 * @param name             Ürün adı
 * @param slug             SEO uyumlu URL parçası
 * @param shortDescription Kısa açıklama (kart altı metin)
 * @param price            Normal satış fiyatı
 * @param discountedPrice  İndirimli fiyat (null ise kampanya yoktur)
 * @param brand            Marka adı
 * @param category         Kategori adı
 * @param stockQuantity    Stok adedi (0 ise "stokta yok" etiketi gösterilir)
 * @param thumbnailUrl     Ürünün birinci görseli (liste kartı için)
 * @param isFeatured       Öne çıkan ürün mü?
 * @param createdAt        Listelemede sıralama için oluşturulma zamanı
 */
public record ProductSummaryResponse(
        UUID       id,
        String     name,
        String     slug,
        String     shortDescription,
        BigDecimal price,
        BigDecimal discountedPrice,
        String     brand,
        String     category,
        Integer    stockQuantity,
        String     thumbnailUrl,
        Boolean    isFeatured,
        Instant    createdAt
) {}
