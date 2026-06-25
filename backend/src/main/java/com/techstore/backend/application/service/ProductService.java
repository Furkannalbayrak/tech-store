package com.techstore.backend.application.service;

import com.techstore.backend.application.dto.product.CategorySummaryResponse;
import com.techstore.backend.application.dto.product.ProductDetailResponse;
import com.techstore.backend.application.dto.product.ProductFilterRequest;
import com.techstore.backend.application.dto.product.ProductSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Ürün İş Mantığı Arayüzü (Service Interface).
 *
 * Ürün listeleme, tekil getirme ve filtreleme işlemleri için
 * sözleşmeyi (contract) tanımlar.
 *
 * SAYFALAMA (PAGINATION) YAKLAŞIMI:
 * Tüm liste metodları Page<> döndürür. Bu sayede:
 *   - Frontend'e toplam kayıt sayısı (totalElements) iletilir.
 *   - Frontend'e toplam sayfa sayısı (totalPages) iletilir.
 *   - Infinite scroll veya sayfalı navigasyon aynı API ile çalışır.
 *
 * İKİ KATMANLI DTO STRATEJİSİ:
 *   - Liste → Page<ProductSummaryResponse>  (thumbnail, fiyat, isim — hafif)
 *   - Detay → ProductDetailResponse         (tüm alanlar, JSONB dahil — tam)
 */
public interface ProductService {

    /**
     * Aktif tüm ürünleri sayfalı olarak döndürür.
     *
     * @param pageable Sayfa numarası, boyutu ve sıralama (örn. price asc)
     * @return Sayfalanmış özet ürün listesi
     */
    Page<ProductSummaryResponse> getAllActiveProducts(Pageable pageable);

    /**
     * Anasayfa "Öne Çıkan Ürünler" bölümü için işaretlenmiş ürünleri getirir.
     *
     * @param pageable Sayfalama (genellikle küçük limit: 4-8 ürün)
     * @return Öne çıkan aktif ürünlerin sayfalanmış listesi
     */
    Page<ProductSummaryResponse> getFeaturedProducts(Pageable pageable);

    /**
     * SEO slug'ı ile tek bir ürünün tam detayını döndürür.
     *
     * @param slug URL'deki SEO uyumlu ürün tanımlayıcısı
     * @return Ürünün tüm alanlarını içeren detay DTO'su
     * @throws com.techstore.backend.domain.exception.EntityNotFoundException
     *         Slug ile eşleşen aktif ürün bulunamazsa
     */
    ProductDetailResponse getProductBySlug(String slug);

    /**
     * UUID ile tek bir ürünün tam detayını döndürür.
     *
     * Yönetim paneli veya slug yerine ID kullanılan senaryolar için.
     *
     * @param id Ürünün UUID birincil anahtarı
     * @return Ürünün tüm alanlarını içeren detay DTO'su
     * @throws com.techstore.backend.domain.exception.EntityNotFoundException
     *         ID ile eşleşen aktif ürün bulunamazsa
     */
    ProductDetailResponse getProductById(UUID id);

    /**
     * Dinamik filtrelerle ürün araması/filtrelemesi yapar.
     *
     * ProductFilterRequest içindeki alanların tümü opsiyoneldir.
     * Null olmayan alanlar birbirleriyle VE (AND) mantığıyla birleştirilir:
     *
     *   Senaryo 1: Sadece keyword dolu → metin araması
     *   Senaryo 2: Sadece attributeFilters dolu → JSONB @> sorgusu
     *   Senaryo 3: category + minPrice + maxPrice dolu → kombinasyon
     *   Senaryo 4: Hepsi dolu → tüm filtreler birlikte uygulanır
     *
     * @param filterRequest Filtre kriterleri (hepsi opsiyonel)
     * @param pageable      Sayfalama ve sıralama
     * @return Filtrelere uyan ürünlerin sayfalanmış listesi
     */
    Page<ProductSummaryResponse> filterProducts(ProductFilterRequest filterRequest, Pageable pageable);

    /**
     * Belirli bir JSONB özellik anahtarı-değer çiftine göre ürün listeler.
     *
     * Örnek kullanım:
     *   filterByAttribute("ram", "16GB")     → 16GB RAM'li ürünler
     *   filterByAttribute("cpu", "M4 Pro")   → M4 Pro işlemcili ürünler
     *
     * Repository'deki findByAttributeKeyValue() native sorgusunu kullanır.
     *
     * @param key      JSONB anahtar adı
     * @param value    Aranan değer
     * @param pageable Sayfalama ve sıralama
     * @return Eşleşen ürünlerin sayfalanmış listesi
     */
    Page<ProductSummaryResponse> filterByAttribute(String key, String value, Pageable pageable);

    /**
     * Navbar Mega Menü için aktif ürünlerin benzersiz kategorilerini ve ürün sayılarını döndürür.
     *
     * @return Her kategorinin adı ve kaç ürün barındırdığını gösteren liste
     */
    List<CategorySummaryResponse> getCategories();

    /**
     * Filtre paneli için aktif ürünlerin benzersiz marka listesini döndürür.
     *
     * @return Marka adları listesi (alfabetik sıralı)
     */
    List<String> getBrands();
}
