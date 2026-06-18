package com.techstore.backend.application.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techstore.backend.application.dto.product.ProductDetailResponse;
import com.techstore.backend.application.dto.product.ProductFilterRequest;
import com.techstore.backend.application.dto.product.ProductSummaryResponse;
import com.techstore.backend.application.mapper.ProductMapper;
import com.techstore.backend.application.service.ProductService;
import com.techstore.backend.domain.entity.Product;
import com.techstore.backend.domain.exception.EntityNotFoundException;
import com.techstore.backend.domain.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * ProductService implementasyonu — Ürün iş mantığı.
 *
 * Bu sınıf şu temel sorumluluklara sahiptir:
 *   1. Repository çağrısı yapma (veri erişimi)
 *   2. İş kurallarını uygulama (filtreleme mantığı, JSONB hazırlama)
 *   3. Entity → DTO dönüşümü (mapper üzerinden)
 *   4. Hata durumlarını yönetme (EntityNotFoundException)
 *
 * DİNAMİK FİLTRELEME STRATEJİSİ:
 * filterProducts() metodu, birden fazla opsiyonel filtreyi kombinleyebilmek
 * için "öncelik sırasına göre dal" (priority branching) yaklaşımını kullanır.
 * İleride bu mantık Spring Specification API'sine veya QueryDSL'e taşınabilir.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper     productMapper;

    // JSONB çoklu filtre sorgusunda Map → JSON String dönüşümü için kullanılır
    private final ObjectMapper objectMapper;

    // =========================================================================
    // TEMEL LİSTELEME METODLARI
    // =========================================================================

    /**
     * Aktif tüm ürünleri sayfalı olarak döndürür.
     *
     * readOnly = true: Bu bir saf okuma işlemi. JPA dirty checking atlanır,
     * bu da özellikle büyük sayfalarda bellek tasarrufu sağlar.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> getAllActiveProducts(Pageable pageable) {
        log.debug("[ProductService] Tüm aktif ürünler isteniyor. page={}, size={}",
                pageable.getPageNumber(), pageable.getPageSize());

        // Repository'den Page<Product> alınır, her entity mapper ile DTO'ya çevrilir.
        // Page.map() metodu, sayfalama meta verisini (totalPages, totalElements vb.)
        // korurken içerikleri dönüştürür; bu bilgiler frontend için kritiktir.
        return productRepository
                .findAllByIsActiveTrue(pageable)
                .map(productMapper::toSummaryResponse);
    }

    /**
     * Anasayfa "Öne Çıkan Ürünler" için işaretlenmiş aktif ürünleri getirir.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> getFeaturedProducts(Pageable pageable) {
        log.debug("[ProductService] Öne çıkan ürünler isteniyor. page={}, size={}",
                pageable.getPageNumber(), pageable.getPageSize());

        return productRepository
                .findAllByIsActiveTrueAndIsFeaturedTrue(pageable)
                .map(productMapper::toSummaryResponse);
    }

    // =========================================================================
    // TEKİL ÜRÜN SORGULARI
    // =========================================================================

    /**
     * Slug ile ürün detayını getirir.
     *
     * Ürün detay sayfasına URL'den gelen slug parametresi ile erişilir.
     * Örn: GET /products/apple-macbook-pro-16 → slug = "apple-macbook-pro-16"
     *
     * orElseThrow: Ürün bulunamazsa EntityNotFoundException fırlatılır.
     * Bu istisna Controller Advice tarafından HTTP 404'e çevrilecektir.
     */
    @Override
    @Transactional(readOnly = true)
    public ProductDetailResponse getProductBySlug(String slug) {
        log.debug("[ProductService] Slug ile ürün aranıyor. slug={}", slug);
        // Optional olarak aldığımız için eğer içine veri varsa Product product diyerek veriyi aldık
        Product product = productRepository.findBySlugAndIsActiveTrue(slug)
        // bu method Optionale ait eğer yoksa yani boşsa bunu fırlat anlamındadır
                .orElseThrow(() -> {
                    log.warn("[ProductService] Ürün bulunamadı. slug={}", slug);
                    return new EntityNotFoundException("Ürün bulunamadı: " + slug);
                });

        // Bulunan entity tam detay DTO'suna dönüştürülür (JSONB, imageUrls dahil)
        return productMapper.toDetailResponse(product);
    }

    /**
     * UUID ile ürün detayını getirir.
     */
    @Override
    @Transactional(readOnly = true)
    public ProductDetailResponse getProductById(UUID id) {
        log.debug("[ProductService] ID ile ürün aranıyor. id={}", id);

        // Optional döndüğü için yine Product product dedik ve eğer boşsa orElseThrow çalışcak
        Product product = productRepository.findById(id)
                .filter(p -> Boolean.TRUE.equals(p.getIsActive())) // Soft delete kontrolü
                .orElseThrow(() -> {
                    log.warn("[ProductService] Aktif ürün bulunamadı. id={}", id);
                    return new EntityNotFoundException("Ürün bulunamadı: " + id);
                });

        return productMapper.toDetailResponse(product);
    }

    // =========================================================================
    // DİNAMİK FİLTRELEME MANTIĞI
    // =========================================================================

    /**
     * Çok parametreli dinamik ürün filtrelemesi.
     *
     * FİLTRELEME ÖNCELİK HİYERARŞİSİ:
     *   1. keyword       → Metin araması (isim veya marka içinde LIKE)
     *   2. attributeFilters → JSONB @> filtresi (en spesifik teknik filtre)
     *   3. category + brand + fiyat → Standart alan filtreleri kombinasyonu
     *
     * Bu öncelik sırası, en çok kullanılan arama senaryolarına göre optimize edilmiştir.
     * İleride Spring Specification veya QueryDSL ile tek bir dinamik sorguya
     * dönüştürülmesi daha esnek bir yapı sağlar; şimdilik dal-tabanlı yaklaşım yeterlidir.
     *
     * @Transactional(readOnly = true): Tüm dallar okuma işlemi yapar.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> filterProducts(ProductFilterRequest filter, Pageable pageable) {
        log.debug("[ProductService] Dinamik filtre uygulanıyor. filtre={}", filter);

        // DAL 1: Serbest metin araması
        if (filter.keyword() != null && !filter.keyword().isBlank()) {
            log.debug("[ProductService] Keyword filtresi aktif. keyword={}", filter.keyword());
            return productRepository
                    .searchByKeyword(filter.keyword().trim(), pageable)
                    .map(productMapper::toSummaryResponse);
        }

        // DAL 2: JSONB attribute filtresi (örn. {"ram":"16GB","cpu":"M4 Pro"})
        if (filter.attributeFilters() != null && !filter.attributeFilters().isEmpty()) {
            log.debug("[ProductService] JSONB attribute filtresi aktif. filtreler={}",
                    filter.attributeFilters());

            // Map<String, String> → JSON String dönüşümü
            // Örn: {"ram": "16GB", "cpu": "M4 Pro"} → '{"ram":"16GB","cpu":"M4 Pro"}'
            String jsonFilter = buildJsonFilterString(filter.attributeFilters());

            return productRepository
                    .findByMultipleAttributes(jsonFilter, pageable)
                    .map(productMapper::toSummaryResponse);
        }

        // DAL 3: Fiyat aralığı filtresi (kategori ve marka ile birlikte veya tek başına)
        if (filter.minPrice() != null && filter.maxPrice() != null) {
            log.debug("[ProductService] Fiyat aralığı filtresi aktif. min={}, max={}",
                    filter.minPrice(), filter.maxPrice());
            return productRepository
                    .findAllByIsActiveTrueAndPriceBetween(filter.minPrice(), filter.maxPrice(), pageable)
                    .map(productMapper::toSummaryResponse);
        }

        // DAL 4: Kategori + Marka kombinasyonu
        if (filter.category() != null && filter.brand() != null) {
            log.debug("[ProductService] Kategori+Marka filtresi aktif. category={}, brand={}",
                    filter.category(), filter.brand());
            return productRepository
                    .findAllByIsActiveTrueAndCategoryIgnoreCaseAndBrandIgnoreCase(
                            filter.category(), filter.brand(), pageable)
                    .map(productMapper::toSummaryResponse);
        }

        // DAL 5: Sadece kategori filtresi
        if (filter.category() != null) {
            log.debug("[ProductService] Kategori filtresi aktif. category={}", filter.category());
            return productRepository
                    .findAllByIsActiveTrueAndCategoryIgnoreCase(filter.category(), pageable)
                    .map(productMapper::toSummaryResponse);
        }

        // DAL 6: Sadece marka filtresi
        if (filter.brand() != null) {
            log.debug("[ProductService] Marka filtresi aktif. brand={}", filter.brand());
            return productRepository
                    .findAllByIsActiveTrueAndBrandIgnoreCase(filter.brand(), pageable)
                    .map(productMapper::toSummaryResponse);
        }

        // DAL 7: Sadece öne çıkan ürünler
        if (Boolean.TRUE.equals(filter.onlyFeatured())) {
            log.debug("[ProductService] Sadece öne çıkan ürünler isteniyor.");
            return productRepository
                    .findAllByIsActiveTrueAndIsFeaturedTrue(pageable)
                    .map(productMapper::toSummaryResponse);
        }

        // VARSAYILAN: Hiçbir filtre yoksa tüm aktif ürünleri döndür
        log.debug("[ProductService] Filtre yok, tüm aktif ürünler döndürülüyor.");
        return productRepository
                .findAllByIsActiveTrue(pageable)
                .map(productMapper::toSummaryResponse);
    }

    /**
     * Tekil JSONB anahtar-değer çiftine göre filtreler.
     *
     * Örn: filterByAttribute("ram", "16GB") → RAM'i 16GB olan ürünler.
     * Repository'deki findByAttributeKeyValue() native sorgusunu kullanır.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> filterByAttribute(String key, String value, Pageable pageable) {
        log.debug("[ProductService] JSONB tekli attribute filtresi. key={}, value={}", key, value);

        return productRepository
                .findByAttributeKeyValue(key, value, pageable)
                .map(productMapper::toSummaryResponse);
    }

    // =========================================================================
    // YARDIMCI METODLAR (Private)
    // =========================================================================

    /**
     * Map<String, String> filtre haritasını PostgreSQL JSONB sorgusu için
     * JSON string'e dönüştürür.
     *
     * Örn: {"ram": "16GB", "cpu": "M4 Pro"} → '{"ram":"16GB","cpu":"M4 Pro"}'
     *
     * Bu string, Repository'deki CAST(:jsonFilterJson AS jsonb) ifadesine
     * parametre olarak geçilir ve JSONB @> operatörü ile kullanılır.
     *
     * Jackson ObjectMapper kullanımının avantajı:
     *   - Manuel string birleştirme hatalarını önler.
     *   - Özel karakterler (tırnak, ters eğik çizgi vb.) otomatik escape edilir.
     *   - SQL Injection riskini minimize eder (parameterized query ile birlikte).
     *
     * @param attributeFilters Filtre haritası
     * @return JSON formatında filtre string'i
     * @throws IllegalArgumentException Serileştirme başarısız olursa
     */
    private String buildJsonFilterString(java.util.Map<String, String> attributeFilters) {
        try {
            return objectMapper.writeValueAsString(attributeFilters);
        } catch (JsonProcessingException e) {
            // Serileştirme başarısız olursa iş akışını durdurmak için RuntimeException
            log.error("[ProductService] JSONB filtre string'i oluşturulamadı. hata={}", e.getMessage());
            throw new IllegalArgumentException("Geçersiz attribute filtresi: " + e.getMessage(), e);
        }
    }
}
