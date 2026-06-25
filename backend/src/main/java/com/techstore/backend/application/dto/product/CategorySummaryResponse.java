package com.techstore.backend.application.dto.product;

/**
 * Kategori özet bilgisi DTO'su.
 * GET /api/v1/products/categories endpoint'inde döndürülür.
 *
 * @param name         Kategori adı (örn. "Laptop", "Akıllı Telefon")
 * @param productCount Bu kategorideki aktif ürün sayısı
 */
public record CategorySummaryResponse(
        String name,
        long productCount
) {}
