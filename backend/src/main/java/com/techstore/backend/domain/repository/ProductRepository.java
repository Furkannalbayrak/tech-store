package com.techstore.backend.domain.repository;

import com.techstore.backend.domain.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Ürün (Product) Repository arayüzü.
 *
 * SAYFALAMA (PAGINATION) STRATEJİSİ:
 * Ürün listeleme metodlarının tümü Pageable parametresi alır.
 * Bunun nedenleri:
 *   1. Performans: Binlerce ürünü tek sorguda çekmek bellek ve ağ bant genişliğini tüketir.
 *   2. UX: Frontend, sayfa sayfa veya "sonsuz kaydırma" (infinite scroll) ile veri yükler.
 *   3. Sıralama: Pageable ile aynı anda sıralama (Sort) da gönderilebilir.
 *      Örnek: PageRequest.of(0, 20, Sort.by("price").ascending())
 *
 * JSONB FİLTRELEME STRATEJİSİ:
 * PostgreSQL'in JSONB operatörleri JPQL tarafından anlaşılmaz.
 * Bu nedenle JSONB içini sorgulayan tüm metodlar nativeQuery = true ile yazılır.
 * JSONB operatörleri:
 *   @>   → "içerir" (containment). Örnek: attributes @> '{"brand":"Apple"}'
 *   ->>  → Belirtilen key'in değerini TEXT olarak çeker. Örnek: attributes->>'ram'
 *   ?    → Key var mı diye bakar. Örnek: attributes ? 'gpu'
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    // =========================================================================
    // TEMEL LİSTELEME METODLARI (Soft Delete Aware)
    // =========================================================================

    /**
     * Vitrine açık (isActive = true) TÜM ürünleri sayfalı olarak döndürür.
     *
     * Kullanım: Anasayfadaki genel ürün listeleri veya "Tüm Ürünler" sayfası.
     * Spring Data türetilmiş JPQL:
     *   SELECT p FROM Product p WHERE p.isActive = true
     *
     * @param pageable Sayfa numarası, boyutu ve sıralama bilgisi
     * @return Aktif ürünlerin sayfalanmış sonucu
     */
    Page<Product> findAllByIsActiveTrue(Pageable pageable);
    // Vitrindeki (silinmemiş) her şeyi getir (Anasayfa listesi).


    /**
     * Anasayfada "Öne Çıkan Ürünler" bölümü için işaretlenmiş aktif ürünleri getirir.
     *
     * Kullanım: Anasayfa hero bölümü veya featured slider.
     * Spring Data türetilmiş JPQL:
     *   SELECT p FROM Product p WHERE p.isActive = true AND p.isFeatured = true
     *
     * @param pageable Sayfalama (genellikle küçük bir limit, örn. PageRequest.of(0, 8))
     * @return Öne çıkan aktif ürünlerin sayfalanmış sonucu
     */
    Page<Product> findAllByIsActiveTrueAndIsFeaturedTrue(Pageable pageable);
    //  Anasayfada "Haftanın Fırsatları / Öne Çıkanlar" bandında gösterilecek ürünleri getir.


    // =========================================================================
    // KATEGORİ VE MARKA FİLTRELEME METODLARI
    // =========================================================================

    /**
     * Belirli bir kategorideki aktif ürünleri sayfalı olarak döndürür.
     *
     * Kullanım: "/kategori/laptop" gibi kategori sayfaları.
     * Spring Data türetilmiş JPQL:
     *   SELECT p FROM Product p WHERE p.isActive = true AND p.category = :category
     *
     * @param category Kategori adı (örn. "Laptop", "Smartphone", "GPU")
     * @param pageable Sayfalama ve sıralama
     * @return Kategoriye göre filtrelenmiş aktif ürünler
     */
    Page<Product> findAllByIsActiveTrueAndCategoryIgnoreCase(String category, Pageable pageable);
    // (Kategoriye göre) Örneğin laptop ile Laptop veya LAPTOP yazılması fark etmez (IgnoreCase sayesinde harf büyüklüğünü umursamaz).


    /**
     * Belirli bir markaya ait aktif ürünleri sayfalı olarak döndürür.
     *
     * Kullanım: Marka sayfası veya filtreleme paneli (örn. "Apple ürünleri").
     * Spring Data türetilmiş JPQL:
     *   SELECT p FROM Product p WHERE p.isActive = true AND p.brand = :brand
     *
     * @param brand Marka adı (örn. "Apple", "Samsung", "ASUS")
     * @param pageable Sayfalama ve sıralama
     * @return Markaya göre filtrelenmiş aktif ürünler
     */
    Page<Product> findAllByIsActiveTrueAndBrandIgnoreCase(String brand, Pageable pageable);

    /**
     * Belirli bir kategorideki belirli bir markaya ait aktif ürünleri getirir.
     *
     * Kullanım: Filtre panelinde hem kategori hem marka seçildiğinde.
     *
     * @param category Kategori adı
     * @param brand    Marka adı
     * @param pageable Sayfalama ve sıralama
     * @return Kategori + marka kombinasyonuna göre filtrelenmiş aktif ürünler
     */
    Page<Product> findAllByIsActiveTrueAndCategoryIgnoreCaseAndBrandIgnoreCase(
            String category, String brand, Pageable pageable
    );

    // =========================================================================
    // SLUG VE ID BAZLI TEKIL ÜRÜN SORGULARI
    // =========================================================================

    /**
     * SEO uyumlu slug değeri ile aktif ürünü getirir.
     *
     * Kullanım: Ürün detay sayfası. URL'den gelen slug parametresi ile
     * tek bir ürün çekilir. Örn: GET /products/apple-macbook-pro-16
     *
     * Optional dönmesinin nedeni: Geçersiz veya silinmiş (pasif) slug
     * için 404 hatası üretmek Service katmanında Optional.orElseThrow()
     * ile kolayca yapılır.
     *
     * @param slug SEO slug değeri (örn. "apple-macbook-pro-16-m4-pro")
     * @return Aktif ürün veya empty Optional
     */
    Optional<Product> findBySlugAndIsActiveTrue(String slug);
    // Ürün detaylarına id ile (site.com/urun/12345) değil, SEO dostu isimle (site.com/urun/apple-macbook-pro) girmemizi sağlar.

    /**
     * Slug'ın başka bir ürüne ait olup olmadığını kontrol eder.
     *
     * Kullanım: Yeni ürün eklenirken veya slug güncellenirken çakışma kontrolü.
     * Aynı slug'ı kullanan başka bir kayıt varsa true döner.
     *
     * @param slug Kontrol edilecek slug değeri
     * @return Slug zaten kullanımda ise true
     */
    boolean existsBySlug(String slug);
    // Satıcı yeni bir ürün eklediğinde aynı linke sahip başka ürün var mı diye kontrol eder ki linkler çakışmasın.

    // =========================================================================
    // FİYAT ARALIĞI FİLTRELEME
    // =========================================================================

    /**
     * Verilen fiyat aralığındaki aktif ürünleri sayfalı olarak döndürür.
     *
     * Kullanım: Frontend'deki fiyat kaydırıcısı (price range slider).
     * Örn: 5000 TL - 20000 TL arasındaki laptoplar.
     *
     * Spring Data türetilmiş JPQL:
     *   SELECT p FROM Product p
     *   WHERE p.isActive = true AND p.price BETWEEN :minPrice AND :maxPrice
     *
     * NOT: İndirimli fiyatı olan ürünler için discountedPrice üzerinden
     * filtreleme gerekirse ayrı bir @Query metodu yazılmalıdır.
     *
     * @param minPrice Minimum fiyat (dahil)
     * @param maxPrice Maksimum fiyat (dahil)
     * @param pageable Sayfalama ve sıralama
     * @return Fiyat aralığındaki aktif ürünler
     */
    Page<Product> findAllByIsActiveTrueAndPriceBetween(
            BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable
    );

    // =========================================================================
    // METİN TABANLI ARAMA (Full-Text Search Lightweight)
    // =========================================================================

    /**
     * Ürün adı veya marka adı içinde belirtilen metni arar (büyük-küçük harf duyarsız).
     *
     * Kullanım: Arama çubuğuna girilen basit metin sorguları.
     * Bu JPQL tabanlı "like" araması, pgvector'dan önce devreye giren
     * hızlı bir ön-filtre görevi görür. Semantik arama daha sonraki
     * adımda AI servisi + pgvector ile birlikte implemente edilecektir.
     *
     * JPQL LOWER + LIKE kombinasyonu:
     *   LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
     * → "apple", "Apple", "APPLE" hepsini yakalar.
     *
     * @param keyword  Aranacak metin (kullanıcının yazdığı)
     * @param pageable Sayfalama ve sıralama
     * @return Eşleşen aktif ürünler
     */
    @Query("""
            SELECT p FROM Product p
            WHERE p.isActive = true
              AND (LOWER(p.name)  LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<Product> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    // Kullanıcı arama çubuğuna "ap" yazdığında hem adında hem de markasında "ap" geçen ürünleri bulur. SQL kodu elle yazılmış (@Query) çünkü "Hem isme hem markaya bak" denilmiş.

    // =========================================================================
    // JSONB ATTRIBUTE FİLTRELEME SORGULARI (Native PostgreSQL)
    // =========================================================================

    /**
     * JSONB attributes kolonu içinde belirtilen anahtar-değer çiftini
     * içeren aktif ürünleri sayfalı olarak döndürür.
     *
     * POSTGRESQL JSONB @> OPERATÖRܑ (containment / içerme):
     *   attributes @> '{"ram": "16GB"}'
     * → attributes JSONB nesnesinin '{"ram": "16GB"}' nesnesini
     *   tam olarak içerip içermediğini kontrol eder.
     *
     * NEDEN NATIVE QUERY?
     * JPQL, @> operatörünü tanımaz. PostgreSQL'e özgü bu operatörü
     * kullanabilmek için nativeQuery = true ile ham SQL yazmak zorunludur.
     *
     * ÖRNEK KULLANIM SENARYOLARI:
     *   findByAttributeKeyValue("ram",       "16GB")   → 16GB RAM'li ürünler
     *   findByAttributeKeyValue("cpu",       "M4 Pro") → M4 Pro işlemcili ürünler
     *   findByAttributeKeyValue("5g",        "true")   → 5G destekli telefonlar
     *   findByAttributeKeyValue("connector", "PCIe 4.0") → PCIe 4.0 ekran kartları
     *
     * JSONSTRING OLUŞTURMA:
     *   jsonb_build_object(:key, :value) → PostgreSQL fonksiyonu ile
     *   tip-güvenli bir JSONB nesnesi oluşturulur.
     *   Bu yöntem, string concatenation yerine kullanılarak SQL Injection'a
     *   karşı ek bir güvenlik katmanı sağlar.
     *
     * SAYFALAMA UYARISI:
     * Native sorgularda sayfalama için ayrıca countQuery tanımlanmalıdır.
     * Spring Data, native sorgularda toplam kayıt sayısını otomatik
     * hesaplayamadığından COUNT sorgusu manuel yazılır.
     *
     * @param key      JSONB içindeki anahtar adı (örn. "ram", "cpu", "battery")
     * @param value    Aranan değer (örn. "16GB", "M4 Pro", "4000mAh")
     * @param pageable Sayfalama ve sıralama bilgisi
     * @return Belirtilen JSONB özelliğine sahip aktif ürünlerin sayfalanmış sonucu
     */
    @Query(
        value = """
                SELECT *
                FROM products p
                WHERE p.is_active = true
                  AND p.attributes @> jsonb_build_object(:key, :value)
                """,
        countQuery = """
                SELECT COUNT(*)
                FROM products p
                WHERE p.is_active = true
                  AND p.attributes @> jsonb_build_object(:key, :value)
                """,
        nativeQuery = true
    )
    Page<Product> findByAttributeKeyValue(
            @Param("key")   String key,
            @Param("value") String value,
            Pageable pageable
    );

    /**
     * Birden fazla JSONB anahtar-değer çiftini aynı anda filtreleyen sorgu.
     *
     * POSTGRESQL JSONB @> OPERATÖRܑ ile çoklu filtre:
     *   attributes @> '{"ram": "16GB", "cpu": "M4 Pro"}'
     * → Hem 16GB RAM hem de M4 Pro CPU'ya sahip ürünleri bulur.
     *
     * jsonFilterJson parametresi, Service katmanından hazır JSON string
     * olarak gelir. Örn: Service tarafında ObjectMapper ile
     *   {"ram": "16GB", "cpu": "M4 Pro"} string'i oluşturulur.
     *
     * Bu yaklaşım, kaç tane filtre uygulandığından bağımsız tek bir
     * veritabanı sorgusu ile sonuç döndürmesini sağlar (N+1 problem yok).
     *
     * CAST kullanımı: ::jsonb ile string'i PostgreSQL'in JSONB tipine
     * cast ediyoruz; bu sayede @> operatörü doğru çalışır.
     *
     * @param jsonFilterJson Filtre olarak kullanılacak JSON string
     *                       (örn. '{"ram":"16GB","cpu":"M4 Pro"}')
     * @param pageable       Sayfalama ve sıralama
     * @return Tüm filtre kriterlerine uyan aktif ürünler
     */
    @Query(
        value = """
                SELECT *
                FROM products p
                WHERE p.is_active = true
                  AND p.attributes @> CAST(:jsonFilterJson AS jsonb)
                """,
        countQuery = """
                SELECT COUNT(*)
                FROM products p
                WHERE p.is_active = true
                  AND p.attributes @> CAST(:jsonFilterJson AS jsonb)
                """,
        nativeQuery = true
    )
    Page<Product> findByMultipleAttributes(
            @Param("jsonFilterJson") String jsonFilterJson,
            Pageable pageable
    );
    // Kullanıcı soldaki filtreden "16GB RAM", "M4 İşlemci", "15 inç" ekranı aynı anda seçerse ne olacak
    /**
     * JSONB attributes içinde belirli bir anahtarın VAR OLUP OLMADIĞINI filtreler.
     *
     * POSTGRESQL JSONB ? OPERATÖRܑ (key existence / anahtar varlık kontrolü):
     *   attributes ? 'gpu'
     * → attributes içinde 'gpu' anahtarı var mı diye bakar (değerine bakmaz).
     *
     * Kullanım: "GPU'su olan ürünler" veya "5G özelliği tanımlı ürünler" gibi
     * bir özelliğin varlığına göre filtreleme yapılmak istendiğinde kullanılır.
     *
     * NOT: ? operatörü Spring @Param ile birlikte kullanıldığında
     * bazı JDBC sürücülerinde parametre çakışması yaşanabilir.
     * Bu nedenle JSONB_EXISTS fonksiyonu ile aynı işlev güvenli şekilde sağlanır.
     *
     * @param attributeKey Varlığı kontrol edilecek JSONB anahtar adı (örn. "gpu", "5g")
     * @param pageable     Sayfalama ve sıralama
     * @return Belirtilen anahtara sahip aktif ürünler
     */
    @Query(
        value = """
                SELECT *
                FROM products p
                WHERE p.is_active = true
                  AND jsonb_exists(p.attributes, :attributeKey)
                """,
        countQuery = """
                SELECT COUNT(*)
                FROM products p
                WHERE p.is_active = true
                  AND jsonb_exists(p.attributes, :attributeKey)
                """,
        nativeQuery = true
    )
    Page<Product> findByAttributeKeyExists(
            @Param("attributeKey") String attributeKey,
            Pageable pageable
    );

    
     // Ben bu sayfada 20 kayıt getirdim ama toplamda kaç kayıt var bilmiyorum" der. 
     // Bu yüzden o metodlarda countQuery = ... diyerek "Toplam kayıt sayısını da bu sorguyla hesapla" diye ikinci bir matematik sorgusu elle yazılmış.

    // =========================================================================
    // SEMANTİK ARAMA (pgvector) — AI ADIMINDA TAMAMLANACAK
    // =========================================================================

    /**
     * pgvector kullanarak anlamsal (semantic) benzerlik araması yapar.
     *
     * COSINE DISTANCE OPERATÖRܑ (<=>):
     *   embedding <=> CAST(:queryEmbedding AS vector)
     * → İki vektör arasındaki kosinüs uzaklığını hesaplar.
     *   0.0 = Tamamen aynı, 1.0 = Tamamen farklı.
     *   ORDER BY ASC ile en yakın (en benzer) ürünler önce gelir.
     *
     * KESİM NOKTASI (threshold):
     *   HAVING distance < 0.3 gibi bir filtre eklemek, alakasız
     *   sonuçları kesmek için kullanılır. Bu değer deneme-yanılma
     *   ile ayarlanır; ilerideki AI entegrasyon adımında yapılandırılacaktır.
     *
     * queryEmbedding FORMAT:
     *   pgvector, vektörü '[0.123, -0.456, ...]' formatında string
     *   olarak bekler. Bu string AI servisinden gelen float[] dizisinin
     *   Arrays.toString() çıktısıdır (köşeli parantezli, virgüllü).
     *
     * NOT: Bu metod şu an için referans amaçlı tanımlanmıştır.
     * AI servisi (OpenAI/Gemini embedding API) entegrasyonu tamamlandıktan
     * sonra Service katmanında aktif olarak kullanılacaktır.
     *
     * @param queryEmbedding Arama sorgusunun vektör temsili (pgvector string formatı)
     * @param limit          Döndürülecek maksimum sonuç sayısı
     * @return Sorguya anlamsal olarak en yakın aktif ürünler (mesafeye göre sıralı)
     */
    @Query(
        value = """
                SELECT *,
                       (embedding <=> CAST(:queryEmbedding AS vector)) AS distance
                FROM products p
                WHERE p.is_active = true
                  AND p.embedding IS NOT NULL
                ORDER BY distance ASC
                LIMIT :limit
                """,
        nativeQuery = true
    )
    List<Product> findSimilarProductsByEmbedding(
            @Param("queryEmbedding") String queryEmbedding,
            @Param("limit")         int limit
    );

    // =========================================================================
    // KATEGORİ VE MARKA KEŞFETME
    // =========================================================================

    /**
     * Aktif ürünlerde kullanılan TÜM benzersiz kategorileri döndürür.
     * Navbar Mega Menü ve filtre paneli için kullanılır.
     *
     * @return Benzersiz kategori adları listesi (alfabetik sıralı)
     */
    @Query("""
            SELECT DISTINCT p.category
            FROM Product p
            WHERE p.isActive = true
              AND p.category IS NOT NULL
            ORDER BY p.category ASC
            """)
    List<String> findDistinctActiveCategories();

    /**
     * Aktif ürünlerde kullanılan TÜM benzersiz markaları döndürür.
     * Filtre paneli marka listesi için kullanılır.
     *
     * @return Benzersiz marka adları listesi (alfabetik sıralı)
     */
    @Query("""
            SELECT DISTINCT p.brand
            FROM Product p
            WHERE p.isActive = true
              AND p.brand IS NOT NULL
            ORDER BY p.brand ASC
            """)
    List<String> findDistinctActiveBrands();

    /**
     * Her kategori için aktif ürün sayısını döndürür.
     * Navbar'daki kategori etiketlerinde ürün sayısı göstermek için.
     *
     * @return [kategori, count] çiftleri listesi
     */
    @Query(value = """
            SELECT category, COUNT(*) as product_count
            FROM products
            WHERE is_active = true
              AND category IS NOT NULL
            GROUP BY category
            ORDER BY product_count DESC
            """, nativeQuery = true)
    List<Object[]> countProductsByCategory();
}
