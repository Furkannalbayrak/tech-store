/**
 * lib/api/product.service.ts
 * --------------------------
 * Ürün API'siyle ilgili tüm istek fonksiyonları.
 *
 * SUNUCU TARAFI (RSC) KULLANIMI:
 * Bu fonksiyonlar Server Component ve Route Handler'larda doğrudan
 * çağrılabilir (token gerektirmeyen public endpoint'ler için).
 * Token gereken endpoint'ler için header manuel eklenir.
 *
 * MİMARİ KARAR:
 * Bileşenler doğrudan axios çağrısı yapmak yerine bu fonksiyonları
 * kullanır. Bu sayede:
 *   - API URL'leri tek bir yerde yönetilir.
 *   - Tip güvenliği (TypeScript) garanti altına alınır.
 *   - Bileşenler test edilirken bu modül kolayca mock'lanır.
 */

import type {
  CategoryInfo,
  PagedResponse,
  ProductDetail,
  ProductFilterRequest,
  ProductListParams,
  ProductSummary,
} from "@/lib/types/api.types";
import apiClient from "./axios-instance";

// ---------------------------------------------------------------------------
// LİSTELEME FONKSİYONLARI
// ---------------------------------------------------------------------------

/**
 * Aktif tüm ürünleri sayfalı olarak getirir.
 * Backend: GET /api/v1/products
 *
 * @param params - Sayfalama ve sıralama parametreleri (hepsi opsiyonel)
 * @returns Spring Page yapısına uygun sayfalanmış ürün listesi
 */
export async function getProducts(params?: ProductListParams): Promise<PagedResponse<ProductSummary>> {
  const response = await apiClient.get<PagedResponse<ProductSummary>>(
    "/products",
    { params }
  );
  return response.data;
}

/**
 * Anasayfa "Öne Çıkan Ürünler" bölümü için ürünleri getirir.
 * Backend: GET /api/v1/products/featured
 *
 * @param size - Kaç ürün getirileceği (varsayılan 8)
 */
export async function getFeaturedProducts(size: number = 8): Promise<PagedResponse<ProductSummary>> {
  const response = await apiClient.get<PagedResponse<ProductSummary>>(
    "/products/featured",
    { params: { size } }
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// TEKİL ÜRÜN FONKSİYONLARI
// ---------------------------------------------------------------------------

/**
 * SEO slug'ı ile tek ürün detayını getirir.
 * Backend: GET /api/v1/products/{slug}
 *
 * Next.js SSG/ISR ile birlikte kullanılır:
 *   export async function generateStaticParams() ile tüm slug'lar pre-render edilir.
 *
 * @param slug - URL'deki ürün tanımlayıcısı (örn. "apple-macbook-pro-16")
 */
export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const response = await apiClient.get<ProductDetail>(`/products/${slug}`);
  return response.data;
}

/**
 * UUID ile tekil ürün detayını getirir.
 * Backend: GET /api/v1/products/id/{uuid}
 *
 * @param id - Ürünün UUID değeri
 */
export async function getProductById(id: string): Promise<ProductDetail> {
  const response = await apiClient.get<ProductDetail>(`/products/id/${id}`);
  return response.data;
}

// ---------------------------------------------------------------------------
// FİLTRELEME FONKSİYONLARI
// ---------------------------------------------------------------------------

/**
 * Dinamik çok-parametreli ürün filtrelemesi.
 * Backend: POST /api/v1/products/filter
 *
 * Karmaşık filtre nesnesi (JSONB attribute haritası dahil) POST body ile gönderilir.
 * GET query parametreleriyle bu yapı taşınamaz.
 *
 * @param filter - Filtre kriterleri (hepsi opsiyonel)
 * @param params - Sayfalama ve sıralama
 */
export async function filterProducts(filter: ProductFilterRequest, params?: ProductListParams
): Promise<PagedResponse<ProductSummary>> {
  const response = await apiClient.post<PagedResponse<ProductSummary>>(
    "/products/filter",
    filter,
    { params }
  );
  return response.data;
}

/**
 * Tek JSONB özellik anahtar-değer çifti ile ürün filtreler.
 * Backend: GET /api/v1/products/attributes?key=ram&value=16GB
 *
 * @param key   - JSONB anahtar adı (örn. "ram", "cpu")
 * @param value - Aranan değer (örn. "16GB", "M4 Pro")
 * @param params - Sayfalama
 */
export async function filterByAttribute(key: string, value: string, params?: ProductListParams
): Promise<PagedResponse<ProductSummary>> {
  const response = await apiClient.get<PagedResponse<ProductSummary>>(
    "/products/attributes",
    { params: { key, value, ...params } }
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// KATEGORİ VE MARKA FONKSİYONLARI
// ---------------------------------------------------------------------------

/**
 * Navbar Mega Menü ve filtre paneli için tüm aktif kategorileri getirir.
 * Backend: GET /api/v1/products/categories
 *
 * Her kategori için ad ve ürün sayısını içerir.
 */
export async function getCategories(): Promise<CategoryInfo[]> {
  const response = await apiClient.get<CategoryInfo[]>("/products/categories");
  return response.data;
}

/**
 * FilterSidebar marka checkbox listesi için tüm aktif markaları getirir.
 * Backend: GET /api/v1/products/brands
 */
export async function getBrands(): Promise<string[]> {
  const response = await apiClient.get<string[]>("/products/brands");
  return response.data;
}
