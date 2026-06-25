/**
 * lib/types/api.types.ts
 * ----------------------
 * Backend API'siyle konuşurken kullanılan tüm TypeScript tip tanımları.
 * Backend'deki Java DTO'larıyla birebir eşleştirilmiştir:
 *   ProductSummaryResponse → ProductSummary
 *   ProductDetailResponse  → ProductDetail
 *   UserResponse           → User
 *   ErrorResponse          → ApiError
 *
 * Bu dosyayı tek kaynak (single source of truth) olarak kullanıyoruz;
 * böylece tüm bileşenler aynı tip sözleşmesine bağlı kalır.
 */

// ---------------------------------------------------------------------------
// SAYFALAMA (Pagination)
// ---------------------------------------------------------------------------

/**
 * Spring Data'nın Page<T> yapısına karşılık gelen generic tip.
 * Backend her liste endpoint'inde bu zarfı döndürür.
 *
 * @example
 *  const response: PagedResponse<ProductSummary> = await api.get('/products')
 */
export interface PagedResponse<T> {
  content: T[];          // Sayfadaki veri dizisi
  totalElements: number; // Toplam kayıt sayısı (tüm sayfalarda)
  totalPages: number;    // Toplam sayfa sayısı
  size: number;          // Sayfa başına kayıt sayısı
  number: number;        // Mevcut sayfa numarası (0-indexed)
  first: boolean;        // İlk sayfa mı?
  last: boolean;         // Son sayfa mı?
  empty: boolean;        // İçerik boş mu?
}

// ---------------------------------------------------------------------------
// ÜRÜN TİPLERİ
// ---------------------------------------------------------------------------

/**
 * Ürün listesi kartlarında kullanılan hafif tip.
 * Backend: ProductSummaryResponse.java
 */
export interface ProductSummary {
  id: string;                   // UUID
  name: string;
  slug: string;
  shortDescription: string | null;
  price: number;
  discountedPrice: number | null;
  brand: string | null;
  category: string | null;
  stockQuantity: number;
  thumbnailUrl: string | null;
  isFeatured: boolean;
  createdAt: string;            // ISO-8601 UTC
}

/**
 * Ürün detay sayfasında kullanılan tam tip.
 * Backend: ProductDetailResponse.java
 */
export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  discountedPrice: number | null;
  brand: string | null;
  category: string | null;
  stockQuantity: number;
  imageUrls: string[];
  /** JSONB kolonu: {"ram":"16GB","cpu":"M4 Pro",...} */
  attributes: Record<string, unknown>;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// KULLANICI TİPİ
// ---------------------------------------------------------------------------

/**
 * Giriş yapmış kullanıcının profil bilgisi.
 * Backend: UserResponse.java
 */
export interface User {
  id: string;           // UUID
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// HATA TİPİ
// ---------------------------------------------------------------------------

/**
 * Backend GlobalExceptionHandler'ın döndürdüğü standart hata zarfı.
 * Backend: ErrorResponse.java
 */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// ---------------------------------------------------------------------------
// KATEGORİ TİPİ
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/products/categories yanıtında dönen kategori özet bilgisi.
 * Backend: CategorySummaryResponse.java
 */
export interface CategoryInfo {
  name: string;         // Kategori adı ("Laptop", "Akıllı Telefon" ...)
  productCount: number; // Bu kategorideki aktif ürün sayısı
}

// ---------------------------------------------------------------------------
// FİLTRE / PARAMETRE TİPLERİ
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/products query parametreleri.
 * Undefined alanlar URL'e eklenmez.
 */
export interface ProductListParams {
  page?: number;
  size?: number;
  sort?: string; // örn. "price,asc" | "createdAt,desc"
}

/**
 * POST /api/v1/products/filter request body'si.
 * Backend: ProductFilterRequest.java
 */
export interface ProductFilterRequest {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  /** JSONB teknik özellik filtreleri: {"ram":"16GB"} */
  attributeFilters?: Record<string, string>;
  keyword?: string;
  onlyFeatured?: boolean;
}

// attributeFilters?: { [key: string]: string };  yukardakiyle aynı anlama sahip

/*
const requestData: ProductFilterRequest = {
  attributeFilters: {
    "ram": "16GB",
    "color": "Red"
  }
};
*/
