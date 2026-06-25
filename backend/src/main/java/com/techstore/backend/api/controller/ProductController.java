package com.techstore.backend.api.controller;

import com.techstore.backend.application.dto.product.CategorySummaryResponse;
import com.techstore.backend.application.dto.product.ProductDetailResponse;
import com.techstore.backend.application.dto.product.ProductFilterRequest;
import com.techstore.backend.application.dto.product.ProductSummaryResponse;
import com.techstore.backend.application.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Ürün REST Controller — Herkese açık (public) ürün endpoint'leri.
 *
 * @RestController: @Controller + @ResponseBody bileşimidir.
 * Tüm metodlar JSON döndürür; ayrıca @ResponseBody yazmaya gerek yoktur.
 *
 * @RequestMapping("/api/v1/products"):
 * Tüm endpoint'lere otomatik olarak bu prefix eklenir.
 * "v1" versiyonlama: İleride breaking change olduğunda "v2" controller
 * açılır; eski clientlar etkilenmez.
 *
 * GÜVENLİK:
 * Bu controller'daki TÜM endpoint'ler SecurityConfig'te "permitAll()" ile
 * herkese açık bırakılmıştır. Ürünleri görmek için giriş gerekmez;
 * bu e-ticaret vitrinin temel özelliğidir.
 *
 * SAYFALAMA:
 * @PageableDefault ile varsayılan sayfalama değerleri ayarlanır.
 * Frontend bu değerleri query parametreleri ile geçersiz kılabilir:
 *   GET /api/v1/products?page=2&size=12&sort=price,asc
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // =========================================================================
    // GENEL LİSTELEME ENDPOİNT'LERİ
    // =========================================================================

    /**
     * GET /api/v1/products
     * Aktif tüm ürünleri sayfalı olarak döndürür.
     *
     * @PageableDefault:
     *   size = 12 → Sayfa başı 12 ürün (3×4 ızgara düzeni için ideal)
     *   sort = createdAt, DESC → Varsayılan sıralama: en yeni ürünler önce
     *
     * Query param örnekleri:
     *   /api/v1/products                        → sayfa 0, 12 ürün, en yeni önce
     *   /api/v1/products?page=1&size=24         → sayfa 1, 24 ürün
     *   /api/v1/products?sort=price,asc         → fiyat artan
     *
     * @return 200 OK — Page<ProductSummaryResponse> (toplam sayfa ve kayıt bilgisiyle)
     */
    @GetMapping
    public ResponseEntity<Page<ProductSummaryResponse>> getAllProducts(
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        log.debug("[ProductController] Tüm ürünler isteniyor. page={}, size={}",
                pageable.getPageNumber(), pageable.getPageSize());
        return ResponseEntity.ok(productService.getAllActiveProducts(pageable));
    }

    /**
     * GET /api/v1/products/featured
     * Anasayfa "Öne Çıkan Ürünler" bölümü için işaretlenmiş ürünleri getirir.
     *
     * Frontend genellikle 4 veya 8 ürün ister; bu yüzden varsayılan size = 8.
     *
     * @return 200 OK — Page<ProductSummaryResponse>
     */
    @GetMapping("/featured")
    public ResponseEntity<Page<ProductSummaryResponse>> getFeaturedProducts(
            @PageableDefault(size = 8, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        log.debug("[ProductController] Öne çıkan ürünler isteniyor.");
        return ResponseEntity.ok(productService.getFeaturedProducts(pageable));
    }

    // =========================================================================
    // TEKİL ÜRÜN SORGULARI
    // =========================================================================

    /**
     * GET /api/v1/products/{slug}
     * SEO slug'ı ile tek bir ürünün tam detayını getirir.
     *
     * Örn: GET /api/v1/products/apple-macbook-pro-16-m4-pro
     * Bu endpoint Next.js'de generateStaticParams() ile statik olarak
     * pre-render edilebilir (SSG). SEO dostu URL yapısı bu sayede sağlanır.
     *
     * Ürün bulunamazsa GlobalExceptionHandler → 404 döner.
     *
     * @param slug URL'deki ürün tanımlayıcısı
     * @return 200 OK — ProductDetailResponse (tüm alanlar, JSONB dahil)
     */
    @GetMapping("/{slug}")
    public ResponseEntity<ProductDetailResponse> getProductBySlug(@PathVariable String slug) {
        log.debug("[ProductController] Slug ile ürün aranıyor. slug={}", slug);
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    /**
     * GET /api/v1/products/id/{id}
     * UUID birincil anahtar ile tekil ürün detayı getirir.
     *
     * Slug değişse bile ID sabit kalır; bu endpoint yönetim paneli veya
     * dahili servis-servis iletişimi için kullanışlıdır.
     *
     * NOT: "/id/{id}" prefix'i, "{slug}" ile çakışmayı önlemek için eklendi.
     * Aksi hâlde Spring, "id" string'ini slug olarak parse ederdi.
     *
     * @param id Ürünün UUID'si
     * @return 200 OK — ProductDetailResponse
     */
    @GetMapping("/id/{id}")
    public ResponseEntity<ProductDetailResponse> getProductById(@PathVariable UUID id) {
        log.debug("[ProductController] UUID ile ürün aranıyor. id={}", id);
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // =========================================================================
    // FİLTRELEME VE ARAMA ENDPOİNT'LERİ
    // =========================================================================

    /**
     * POST /api/v1/products/filter
     * Dinamik çok-parametreli ürün filtrelemesi.
     *
     * NEDEN POST (GET yerine)?
     * GET request'lerinde body taşımak teknik olarak mümkün ama RFC 7230 uyumsuz
     * ve birçok proxy/cache bunu desteklemez. Filtre kriterleri (özellikle JSONB
     * attribute haritası) karmaşık nesne yapısında olduğundan POST body tercih edilir.
     *
     * İstek gövdesi (body) örneği:
     *   {
     *     "category": "Laptop",
     *     "brand": "Apple",
     *     "minPrice": 40000,
     *     "maxPrice": 80000,
     *     "attributeFilters": { "ram": "16GB", "cpu": "M4 Pro" }
     *   }
     *
     * @param filterRequest Filtre kriterleri (@Valid ile Bean Validation aktif)
     * @param pageable      Sayfalama ve sıralama
     * @return 200 OK — Page<ProductSummaryResponse>
     */
    @PostMapping("/filter")
    public ResponseEntity<Page<ProductSummaryResponse>> filterProducts(
            @Valid @RequestBody ProductFilterRequest filterRequest,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        log.debug("[ProductController] Dinamik filtre isteği. filtre={}", filterRequest);
        return ResponseEntity.ok(productService.filterProducts(filterRequest, pageable));
    }

    /**
     * GET /api/v1/products/attributes?key=ram&value=16GB
     * Tek bir JSONB özellik anahtar-değer çifti ile ürün filtreler.
     *
     * Örn:
     *   /api/v1/products/attributes?key=ram&value=16GB
     *   /api/v1/products/attributes?key=cpu&value=M4+Pro
     *   /api/v1/products/attributes?key=5g&value=true
     *
     * Repository'deki findByAttributeKeyValue() native JSONB @> sorgusunu kullanır.
     *
     * @param key      JSONB anahtar adı (örn. "ram", "cpu", "battery")
     * @param value    Aranan değer (örn. "16GB", "M4 Pro")
     * @param pageable Sayfalama ve sıralama
     * @return 200 OK — Page<ProductSummaryResponse>
     */
    // @RequestParam Nedir?: Adres yolunun sonuna bir Soru İşareti (?) koyarak eklenen ek parametrelerdir.
    // URL'yi şu şekilde hazırlar: 👉 .../attributes?key=ram&value=16GB
    @GetMapping("/attributes")
    public ResponseEntity<Page<ProductSummaryResponse>> filterByAttribute(
            @RequestParam String key,
            @RequestParam String value,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        log.debug("[ProductController] JSONB attribute filtresi. key={}, value={}", key, value);
        return ResponseEntity.ok(productService.filterByAttribute(key, value, pageable));
    }

    // =========================================================================
    // KATEGORİ VE MARKA ENDPOINT'LERİ
    // =========================================================================

    /**
     * GET /api/v1/products/categories
     * Vitrinindeki aktif ürünlerin benzersiz kategori listesini ve
     * her kategorideki ürün sayısını döndürür.
     *
     * Frontend kullanımı: Navbar Mega Menü, Filtre Paneli, Kategori sayfası.
     *
     * Örnek yanıt:
     *   [{"name":"Laptop","productCount":230},{"name":"Akıllı Telefon","productCount":185}, ...]
     *
     * @return 200 OK — List<CategorySummaryResponse>
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategorySummaryResponse>> getCategories() {
        log.debug("[ProductController] Kategori listesi isteniyor.");
        return ResponseEntity.ok(productService.getCategories());
    }

    /**
     * GET /api/v1/products/brands
     * Vitrinindeki aktif ürünlerin benzersiz marka listesini döndürür.
     *
     * Frontend kullanımı: FilterSidebar marka checkbox listesi.
     *
     * @return 200 OK — List<String>
     */
    @GetMapping("/brands")
    public ResponseEntity<List<String>> getBrands() {
        log.debug("[ProductController] Marka listesi isteniyor.");
        return ResponseEntity.ok(productService.getBrands());
    }
}
