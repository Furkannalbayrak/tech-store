/**
 * app/products/page.tsx
 * --------------------------------
 * SUNUCU BİLEŞENİ — Ürün Listeleme Sayfası.
 *
 * MİMARİ KARAR: Server Component + Client Shell
 * ─────────────────────────────────────────────
 * Bu sayfa iki katmandan oluşur:
 *
 * 1. Server (bu dosya):
 *    - URL parametrelerini okur (category, keyword, sort, page)
 *    - Spring Boot backend'ine direkt fetch atar
 *    - İlk sayfa verisini + toplam ürün sayısını hazırlar
 *    - SEO için <title> ve <meta> üretir
 *
 * 2. Client Shell (ProductsClient.tsx):
 *    - Gelen ürünleri ekranda gösterir
 *    - Marka / fiyat / indirim filtrelerini client-side uygular
 *    - Sıralama, görünüm modu (grid/list) durumunu yönetir
 *    - Sayfalama URL'ini günceller (router.push)
 *    - Mobil drawer filtre panelini kontrol eder
 *
 * SAYFALAMA:
 *    URL'deki ?page=N, backend'e doğrudan iletilir.
 *    Filtreler (brand, price, discount) frontend'de uygulanır.
 *    Backend hazır filtreleme API'sine geçildiğinde burası güncellenir.
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import ProductsClient from "@/components/products/ProductsClient";
import { PLACEHOLDER_SUMMARY_PRODUCTS } from "@/lib/data/placeholder-products";
import type { ProductSummary, PagedResponse } from "@/lib/types/api.types";

/* ============================================================
   VERİ ÇEKME — Backend fetch (native fetch, Axios değil)
   Server Component'ta Axios çalışmaz — native fetch kullan.
   ============================================================ */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

async function fetchProducts(params: {
  category?: string;
  keyword?: string;
  brand?: string;
  sort?: string;
  page?: number;
  size?: number;
}): Promise<PagedResponse<ProductSummary>> {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page - 1)); // Backend 0-indexed
  if (params.size != null) q.set("size", String(params.size));

  // Sıralama dönüşümü (frontend değeri → Spring Boot format)
  const sortMap: Record<string, string> = {
    "price-asc": "price,asc",
    "price-desc": "price,desc",
    "newest": "createdAt,desc",
    "default": "createdAt,desc",
  };
  const backendSort = sortMap[params.sort ?? "default"] ?? "createdAt,desc";
  q.set("sort", backendSort);

  // POST /filter endpoint'i kullanarak kategori ve arama filtresini backend'e gönderiyoruz
  const url = `${API_BASE}/products/filter?${q.toString()}`;

  const body = {
    category: params.category,
    keyword: params.keyword,
  };

  const res = await fetch(url, {
    method: 'POST',
    next: { revalidate: 60 }, // 1 dakika ISR cache
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`Backend ${res.status}: ${url}`);
  return res.json();
}

/* ============================================================
   METADATA
   ============================================================ */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}): Promise<Metadata> {
  const p = await searchParams;
  const category = p.category;
  const keyword = p.keyword;

  if (category) {
    return {
      title: `${category} | TechStore`,
      description: `${category} kategorisindeki en iyi ürünleri TechStore'da bulun. Ücretsiz kargo ve kolay iade garantisi.`,
    };
  }
  if (keyword) {
    return {
      title: `"${keyword}" arama sonuçları | TechStore`,
      description: `"${keyword}" araması için bulunan ürünler.`,
    };
  }
  return {
    title: "Tüm Ürünler | TechStore",
    description: "TechStore'un tüm ürün kataloğuna göz atın. 1.000+ çeşit teknoloji ürünü.",
  };
}

/* ============================================================
   ANA SAYFA BİLEŞENİ
   ============================================================ */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const p = await searchParams;

  const category = p.category;
  const keyword = p.keyword;
  const sort = p.sort ?? "default";
  const page = Number(p.page ?? "1");

  // Veritabanındaki tüm ürünleri tek seferde çek (client-side filtreler için)
  // Bu sayede kullanıcı marka/fiyat filtreleri değiştirdiğinde yeni bir
  // backend isteği yapmaya gerek kalmaz.
  const PAGE_SIZE_BACKEND = 10000; // Sınırı kaldırdık, çok yüksek bir sayı verdik

  let allProducts: ProductSummary[] = [];
  let totalElements = 0;
  let isPlaceholder = false;

  try {
    const resp = await fetchProducts({
      category,
      keyword,
      sort,
      page: 1,           // Her zaman ilk sayfayı çek (48 ürün)
      size: PAGE_SIZE_BACKEND,
    });
    allProducts = resp.content;
    totalElements = resp.totalElements;
  } catch (err) {
    // Backend çevrimdışı → placeholder veri
    console.warn("[ProductsPage] Backend erişilemedi, placeholder kullanılıyor:", err);
    allProducts = PLACEHOLDER_SUMMARY_PRODUCTS;
    totalElements = PLACEHOLDER_SUMMARY_PRODUCTS.length;
    isPlaceholder = true;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Suspense fallback={<ProductsLoadingSkeleton />}>
        <ProductsClient
          initialProducts={allProducts}
          totalElements={totalElements}
          isPlaceholder={isPlaceholder}
          initialCategory={category}
          initialKeyword={keyword}
          initialSort={sort}
          initialPage={page}
        />
      </Suspense>
    </div>
  );
}

/* ============================================================
   YÜKLEME İSKELETİ
   ============================================================ */
function ProductsLoadingSkeleton() {
  return (
    <div className="max-w-[1340px] mx-auto px-4 py-8">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="flex gap-6">
        <div className="hidden lg:block w-60 flex-shrink-0 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
