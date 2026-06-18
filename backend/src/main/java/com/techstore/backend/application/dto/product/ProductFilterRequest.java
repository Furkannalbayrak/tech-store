package com.techstore.backend.application.dto.product;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Ürün Filtreleme İstek DTO'su — Gelişmiş arama/filtreleme için.
 *
 * Frontend'deki filtre panelinden gelen parametreleri tek bir nesne olarak taşır.
 * Tüm alanlar opsiyoneldir (null kontrolü Service katmanında yapılır).
 * Null olan alanlar sorgu koşuluna dahil edilmez (dinamik filtreleme).
 *
 * JSONB FİLTRELEME:
 * attributeFilters haritası, JSONB @> operatörü için kullanılır.
 * Örn: {"ram": "16GB", "cpu": "M4 Pro"} → attributes @> '{"ram":"16GB","cpu":"M4 Pro"}'
 *
 * Kullanım: POST /api/products/filter (body olarak gönderilir)
 * veya GET /api/products?category=Laptop&brand=Apple&minPrice=10000 (query param)
 *
 * @param category         Kategori filtresi (örn. "Laptop")
 * @param brand            Marka filtresi (örn. "Apple")
 * @param minPrice         Minimum fiyat (dahil)
 * @param maxPrice         Maksimum fiyat (dahil)
 * @param attributeFilters JSONB teknik özellik filtreleri (key-value çiftleri)
 * @param keyword          Serbest metin arama (isim veya marka içinde arar)
 * @param onlyFeatured     Sadece öne çıkan ürünleri getir
 */
public record ProductFilterRequest(

        String category,

        String brand,

        @DecimalMin(value = "0.0", inclusive = true, message = "Minimum fiyat 0'dan küçük olamaz")
        BigDecimal minPrice,

        @DecimalMin(value = "0.0", inclusive = true, message = "Maksimum fiyat 0'dan küçük olamaz")
        BigDecimal maxPrice,

        // JSONB filtresi: {"ram": "16GB"} gibi anahtar-değer çiftleri
        Map<String, String> attributeFilters,

        @Size(max = 200, message = "Arama terimi 200 karakteri geçemez")
        String keyword,

        Boolean onlyFeatured
) {}
