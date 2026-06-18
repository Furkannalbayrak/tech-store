package com.techstore.backend.application.mapper;

import com.techstore.backend.application.dto.product.ProductDetailResponse;
import com.techstore.backend.application.dto.product.ProductSummaryResponse;
import com.techstore.backend.domain.entity.Product;
import org.springframework.stereotype.Component;

import java.util.List;

/**
1. Önce içi boş bir nesne yarat
ProductSummaryResponse response = new ProductSummaryResponse();

2. Sonra içini tek tek setter'lar ile doldur
response.setId(product.getId());
response.setName(product.getName());
response.setSlug(product.getSlug());
response.setPrice(product.getPrice());
response.setBrand(product.getBrand());
// ... diğer 10 tane özellik ...

3. Son olarak doldurulmuş bu nesneyi döndür
return response;
 */

/**
 * Product Entity ↔ DTO dönüşüm sınıfı.
 *
 * İki farklı DTO seviyesi için ayrı metodlar içerir:
 *   1. toSummaryResponse → Liste sayfası (hafif yük, sadece kart bilgisi)
 *   2. toDetailResponse  → Detay sayfası (tüm alanlar, JSONB dahil)
 *
 * Bu ikili yapı sayesinde ağ trafiği optimize edilir:
 *   - Liste sayfasında 20 ürün × (description + attributes) = gereksiz MB'lar önlenir.
 *   - Detay sayfasında zaten 1 ürün çekildiği için tüm alanlar sorunsuz gönderilir.
 */
@Component
public class ProductMapper {

    /**
     * Product Entity → ProductSummaryResponse dönüşümü.
     *
     * Liste kartları için minimal veri seti:
     *   - description ve attributes DÖNMEZ (bandwidth tasarrufu)
     *   - imageUrls listesinin sadece birinci elemanı (thumbnail) dönülür.
     *     Liste boşsa thumbnail null olur; frontend bu durumu varsayılan
     *     görsel ile karşılamalıdır.
     *
     * @param product Veritabanından gelen Product entity'si
     * @return Hafif özet DTO
     */
    public ProductSummaryResponse toSummaryResponse(Product product) {
        // Ürünün birinci görselini thumbnail olarak al; yoksa null
        String thumbnail = (product.getImageUrls() != null && !product.getImageUrls().isEmpty())
                ? product.getImageUrls().get(0)
                : null;

        return new ProductSummaryResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getShortDescription(),
                product.getPrice(),
                product.getDiscountedPrice(),
                product.getBrand(),
                product.getCategory(),
                product.getStockQuantity(),
                thumbnail,
                product.getIsFeatured(),
                product.getCreatedAt()
        );
    }

    /**
     * Product Entity → ProductDetailResponse dönüşümü.
     *
     * Ürün detay sayfası için TÜM alanlar dönülür:
     *   - imageUrls listesinin tamamı (galeri için)
     *   - attributes JSONB haritası (teknik özellikler tablosu için)
     *   - description (tam açıklama)
     *
     * embedding vektörü buraya DAHİL EDİLMEZ; bu iç AI verisidir.
     *
     * @param product Veritabanından gelen Product entity'si
     * @return Tam detay DTO
     */
    public ProductDetailResponse toDetailResponse(Product product) {
        return new ProductDetailResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getShortDescription(),
                product.getDescription(),
                product.getPrice(),
                product.getDiscountedPrice(),
                product.getBrand(),
                product.getCategory(),
                product.getStockQuantity(),
                product.getImageUrls(),
                product.getAttributes(),
                product.getIsFeatured(),
                product.getIsActive(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    /**
     * Product Entity listesini ProductSummaryResponse listesine dönüştürür.
     *
     * Repository'den gelen toplu Entity koleksiyonlarını
     * tek bir çağrıyla toplu olarak DTO'ya çevirir.
     * Stream + map kullanımı Java 8+ standart pratiğidir.
     *
     * @param products Entity listesi
     * @return Özet DTO listesi
     */
    public List<ProductSummaryResponse> toSummaryResponseList(List<Product> products) {
        return products.stream()
                .map(this::toSummaryResponse)
                .toList(); // Java 16+ immutable list (Collections.unmodifiableList)
    }
}
