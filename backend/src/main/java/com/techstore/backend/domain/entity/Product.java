package com.techstore.backend.domain.entity;

import com.techstore.backend.domain.common.BaseEntity;
import com.techstore.backend.infrastructure.persistence.converter.JsonbConverter;
import com.techstore.backend.infrastructure.persistence.converter.StringListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Ürün (Product) Entity sınıfı.
 *
 * Teknoloji mağazasındaki satılık ürünleri temsil eder.
 * Temel tasarım kararları:
 *
 * 1. JSONB (attributes): Her ürün kategorisinin farklı teknik özellikleri
 *    olduğundan (laptop için RAM, telefon için batarya vb.) şema değiştirmeden
 *    esnek veri saklamak için JSONB kullanılır. @Convert ile JsonbConverter devreye girer.
 *
 * 2. TEXT[] (imageUrls): Bir ürünün birden fazla görseli olabileceği için
 *    resim URL'leri List<String> olarak tutulur. StringListConverter bu dönüşümü yönetir.
 *
 * 3. embedding (pgvector): Anlamsal (semantic) arama için ürünün vektör temsili.
 *    OpenAI/Gemini API'den üretilen float dizisi burada saklanır.
 *    JPA bu alanı float[] olarak eşler; pgvector ise veritabanında vector(1536) tipinde saklar.
 *
 * 4. Soft Delete (isActive): Ürün silindiğinde veritabanından kaldırılmaz,
 *    sadece isActive = false yapılır. Böylece eski siparişlerde ürün bilgisi korunur.
 *
 * 5. BigDecimal (price): Finansal değerlerde FLOAT yerine BigDecimal kullanmak
 *    zorunludur; bu sayede para birimi hesaplamalarında yuvarlama hatası oluşmaz.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "products",
    indexes = {
        @Index(name = "idx_products_slug",     columnList = "slug"),
        @Index(name = "idx_products_brand",    columnList = "brand"),
        @Index(name = "idx_products_category", columnList = "category"),
        @Index(name = "idx_products_active",   columnList = "is_active"),
        @Index(name = "idx_products_featured", columnList = "is_featured"),
        @Index(name = "idx_products_price",    columnList = "price")
    }
)
public class Product extends BaseEntity {

    /**
     * Ürünün tam adı.
     * Örnek: "Apple MacBook Pro 16 M4 Pro 48GB 512GB"
     */
    @Column(name = "name", nullable = false, length = 500)
    private String name;

    /**
     * SEO uyumlu URL parçası (slug).
     * Otomatik üretilir: "Apple MacBook Pro 16" → "apple-macbook-pro-16"
     * unique = true: Aynı slug iki ürüne atanamaz (URL çakışması önlenir).
     */
    @Column(name = "slug", nullable = false, unique = true, length = 600)
    private String slug;

    /**
     * Kısa açıklama: Ürün listesi kartlarında ve meta description'da kullanılır.
     * Max 500 karakter.
     */
    @Column(name = "short_description", length = 500)
    private String shortDescription;

    /**
     * Uzun açıklama: Ürün detay sayfasında tam içerik olarak gösterilir.
     * Markdown formatında olabilir.
     * columnDefinition = "TEXT" → sınırsız uzunluk.
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Satış fiyatı.
     * BigDecimal: Para birimi hesaplarında hassasiyet için zorunludur.
     * precision=10, scale=2 → Maksimum 99.999.999,99 değerine izin verir.
     */
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /**
     * İndirimli satış fiyatı (opsiyonel).
     * NULL ise ürün kampanyada değildir.
     * Frontend bu değere bakarak "indirim oranı" hesaplar.
     */
    @Column(name = "discounted_price", precision = 10, scale = 2)
    private BigDecimal discountedPrice;

    /**
     * Marka adı.
     * Örnek: "Apple", "Samsung", "ASUS", "MSI", "Logitech"
     * Filtreleme ve gruplama sorguları için indekslenmiştir.
     */
    @Column(name = "brand", length = 150)
    private String brand;

    /**
     * Ürün kategorisi.
     * Örnek: "Laptop", "Smartphone", "GPU", "Monitor", "Keyboard"
     * Dinamik kategori sayfaları bu değere göre sorgulanır.
     */
    @Column(name = "category", length = 150)
    private String category;

    /**
     * Stok miktarı.
     * 0 → Stok tükendi (satışa kapalı ama listelenir).
     * CHECK kısıtı veritabanında negatif değeri engeller.
     */
    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    /**
     * Ürün görsel URL'leri listesi.
     *
     * PostgreSQL: TEXT[] kolonu olarak saklanır.
     * Java:       List<String> olarak erişilir.
     *
     * StringListConverter bu iki format arasındaki dönüşümü otomatik yapar.
     * Görseller lokal dosya sisteminde veya CDN'de tutulur;
     * buraya sadece erişim path/URL'leri yazılır.
     *
     * columnDefinition = "TEXT": TEXT[] yerine TEXT kullanıldığında
     * Hibernate'in type resolution sorunlarını önler. Fiziksel şema
     * zaten SQL betiğinde TEXT[] olarak oluşturulmuştur.
     */
    @Convert(converter = StringListConverter.class)
    @Column(name = "image_urls", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    /**
     * Dinamik ürün özellikleri (JSONB).
     *
     * PostgreSQL: JSONB kolonu olarak saklanır (binary sıkıştırılmış JSON).
     * Java:       Map<String, Object> olarak erişilir.
     *
     * JsonbConverter bu iki format arasındaki dönüşümü Jackson ile yapar.
     *
     * Örnek içerik (Laptop):
     *   {
     *     "cpu":       "Apple M4 Pro",
     *     "ram":       "48GB",
     *     "storage":   "512GB SSD",
     *     "screen":    "16.2 inch Liquid Retina XDR",
     *     "battery":   "100Wh",
     *     "os":        "macOS Sequoia"
     *   }
     */
    @Convert(converter = JsonbConverter.class)
    @Column(name = "attributes", columnDefinition = "TEXT")
    @Builder.Default
    private Map<String, Object> attributes = new HashMap<>();

    /**
     * pgvector: Anlamsal arama embedding vektörü.
     *
     * OpenAI text-embedding-3-small → 1536 boyutlu float dizisi.
     * Bu vektör; ürün adı + açıklaması + özelliklerinden üretilir.
     *
     * Kullanım senaryosu:
     *   "Oyun için iyi bir laptop" → sorgu vektörü üret →
     *   Kosinüs benzerliği ile en yakın ürünleri bul →
     *   Anlamlı öneri listesi döndür.
     *
     * @Column columnDefinition = "vector(1536)": Hibernate'e bu alanın
     * veritabanında özel bir tip olduğunu söyler. pgvector eklentisi
     * bu tipi tanır ve HNSW indeksi ile verimli sorgulama yapar.
     * float[] Java'nın primitive array tipidir; vektör değerleri burada tutulur.
     */
    @Column(name = "embedding", columnDefinition = "vector(1536)")
    private float[] embedding;

    /**
     * Soft Delete bayrağı.
     * false → Ürün pasif (vitrinde görünmez, eski siparişlerde korunur).
     * true  → Ürün aktif ve satışa açık.
     */
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /**
     * Öne çıkan ürün bayrağı.
     * true  → Anasayfada "Öne Çıkan Ürünler" bölümünde gösterilir.
     * false → Standart listeleme.
     */
    @Builder.Default
    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;
}
