"use client";

/**
 * app/products/page.tsx
 * ----------------------
 * Tam özellikli ürün listesi sayfası.
 *
 * "use client" seçiminin sebebi:
 *  - URL arama parametrelerini dinamik olarak okumak (useSearchParams)
 *  - Filtre durumunu gerçek zamanlı yönetmek
 *  - Mobil filtre drawer'ı için lokal state
 *
 * VERİ STRATEJİSİ:
 *  Önce backend'den çek → başarısız olursa placeholder veri göster.
 *  Filtreler client-side uygulanır (backend hazır olduğunda API'ye taşınacak).
 */

import { Suspense, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SlidersHorizontal, X, Grid3X3, LayoutList,
  ChevronLeft, ChevronRight, ArrowUpDown, PackageSearch
} from "lucide-react";
import FilterSidebar from "@/components/products/FilterSidebar";
import ProductCard from "@/components/home/ProductCard";
import FeaturedProductsSkeleton from "@/components/home/ProductCardSkeleton";
import {
  PLACEHOLDER_SUMMARY_PRODUCTS,
  getProductMeta,
} from "@/lib/data/placeholder-products";
import type { ProductSummary } from "@/lib/types/api.types";

// ---------------------------------------------------------------------------
// SABİTLER
// ---------------------------------------------------------------------------
const PAGE_SIZE = 12;
const SORT_OPTIONS = [
  { value: "default",      label: "Önerilen" },
  { value: "price-asc",    label: "Fiyat: Düşükten Yükseğe" },
  { value: "price-desc",   label: "Fiyat: Yüksekten Düşüğe" },
  { value: "rating-desc",  label: "En Yüksek Puan" },
  { value: "newest",       label: "En Yeniler" },
  { value: "discount-desc",label: "En Yüksek İndirim" },
];

// ---------------------------------------------------------------------------
// YARDIMCI: Ürünleri filtrele + sırala
// ---------------------------------------------------------------------------
function applyFilters(
  products: ProductSummary[],
  params: URLSearchParams
): ProductSummary[] {
  let result = [...products];

  const category    = params.get("category");
  const brands      = params.get("brand")?.split(",").filter(Boolean) ?? [];
  const minPrice    = params.get("minPrice") ? Number(params.get("minPrice")) : null;
  const maxPrice    = params.get("maxPrice") ? Number(params.get("maxPrice")) : null;
  const minRating   = params.get("minRating") ? Number(params.get("minRating")) : null;
  const onlyDiscount = params.get("onlyDiscount") === "1";
  const fastDelivery = params.get("fastDelivery") === "1";
  const keyword     = params.get("keyword")?.toLowerCase();
  const sort        = params.get("sort") ?? "default";

  if (category)    result = result.filter(p => p.category === category);
  if (brands.length) result = result.filter(p => brands.includes(p.brand ?? ""));
  if (minPrice != null) result = result.filter(p => (p.discountedPrice ?? p.price) >= minPrice);
  if (maxPrice != null) result = result.filter(p => (p.discountedPrice ?? p.price) <= maxPrice);
  if (onlyDiscount) result = result.filter(p => p.discountedPrice != null);
  if (keyword)      result = result.filter(p =>
    p.name.toLowerCase().includes(keyword) ||
    p.brand?.toLowerCase().includes(keyword) ||
    p.category?.toLowerCase().includes(keyword)
  );

  if (minRating != null) {
    result = result.filter(p => {
      const { rating } = getProductMeta(p.id);
      return rating >= minRating;
    });
  }

  if (fastDelivery) {
    result = result.filter(p => getProductMeta(p.id).hasFastDelivery);
  }

  // Sıralama
  result.sort((a, b) => {
    const pa = a.discountedPrice ?? a.price;
    const pb = b.discountedPrice ?? b.price;
    const ra = getProductMeta(a.id).rating;
    const rb = getProductMeta(b.id).rating;
    const da = a.discountedPrice ? Math.round(((a.price - a.discountedPrice) / a.price) * 100) : 0;
    const db = b.discountedPrice ? Math.round(((b.price - b.discountedPrice) / b.price) * 100) : 0;

    switch (sort) {
      case "price-asc":    return pa - pb;
      case "price-desc":   return pb - pa;
      case "rating-desc":  return rb - ra;
      case "discount-desc":return db - da;
      case "newest":       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:             return b.isFeatured ? 1 : -1;
    }
  });

  return result;
}

// ---------------------------------------------------------------------------
// AKTİF FİLTRE CHİPLERİ
// ---------------------------------------------------------------------------
function ActiveFilterChips({ params }: { params: URLSearchParams }) {
  const router = useRouter();

  const remove = useCallback((key: string, val?: string) => {
    const p = new URLSearchParams(params.toString());
    if (val) {
      const list = p.get(key)?.split(",").filter(b => b !== val) ?? [];
      list.length ? p.set(key, list.join(",")) : p.delete(key);
    } else {
      p.delete(key);
    }
    p.delete("page");
    router.push(`?${p.toString()}`);
  }, [params, router]);

  const chips: { label: string; onRemove: () => void }[] = [];

  const category = params.get("category");
  if (category) chips.push({ label: category, onRemove: () => remove("category") });

  (params.get("brand")?.split(",").filter(Boolean) ?? []).forEach(b =>
    chips.push({ label: b, onRemove: () => remove("brand", b) })
  );

  const minP = params.get("minPrice"), maxP = params.get("maxPrice");
  if (minP || maxP) chips.push({
    label: `₺${minP ?? "0"} – ₺${maxP ?? "∞"}`,
    onRemove: () => { remove("minPrice"); remove("maxPrice"); }
  });

  const mr = params.get("minRating");
  if (mr) chips.push({ label: `${mr}★ ve üzeri`, onRemove: () => remove("minRating") });

  if (params.get("onlyDiscount") === "1")
    chips.push({ label: "Sadece İndirimli", onRemove: () => remove("onlyDiscount") });
  if (params.get("fastDelivery") === "1")
    chips.push({ label: "Hızlı Teslimat", onRemove: () => remove("fastDelivery") });

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={chip.onRemove}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                     bg-blue-500/15 text-blue-400 border border-blue-500/25
                     hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/25
                     transition-all duration-150"
        >
          {chip.label}
          <X className="w-3 h-3" />
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SAYFALAMA
// ---------------------------------------------------------------------------
function Pagination({ current, total, onPage }: {
  current: number; total: number; onPage: (p: number) => void;
}) {
  if (total <= 1) return null;

  const pages = Array.from({ length: Math.min(total, 5) }, (_, i) => {
    if (total <= 5) return i + 1;
    if (current <= 3) return i + 1;
    if (current >= total - 2) return total - 4 + i;
    return current - 2 + i;
  });

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onPage(current - 1)}
        disabled={current === 1}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
            p === current
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPage(current + 1)}
        disabled={current === total}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SAYFA SARMALAYICI (Suspense gerekli — useSearchParams)
// ---------------------------------------------------------------------------
function ProductsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const currentPage = Number(searchParams.get("page") ?? "1");
  const sort = searchParams.get("sort") ?? "default";

  const filtered = useMemo(
    () => applyFilters(PLACEHOLDER_SUMMARY_PRODUCTS, searchParams),
    [searchParams]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setSort = (s: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", s);
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ---- SAYFA BAŞLIĞI ---- */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {searchParams.get("category") ?? "Tüm Ürünler"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length.toLocaleString("tr-TR")} ürün listeleniyor
          </p>
        </div>

        <div className="flex gap-8">

          {/* ================================================================
              SOL: MASAÜSTÜ FİLTRE PANELİ
              ================================================================ */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <FilterSidebar />
            </div>
          </div>

          {/* ================================================================
              SAĞ: ÜRÜN ALANI
              ================================================================ */}
          <div className="flex-1 min-w-0">

            {/* ---- SIRA VE GÖRÜNÜM ÇUBUĞU ---- */}
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Mobil filtre butonu */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                             bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtreler
                </button>

                {/* Sıralama */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="text-sm text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} className="bg-white">{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Görünüm modu */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-gray-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Aktif filtre chip'leri */}
            <ActiveFilterChips params={searchParams} />

            {/* ---- ÜRÜN GRİD'İ ---- */}
            {paged.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-24 text-center bg-white rounded-2xl border border-gray-200">
                <PackageSearch className="w-16 h-16 text-gray-400" strokeWidth={1} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">Ürün bulunamadı</p>
                  <p className="text-sm text-gray-500 mt-1">Filtrelerinizi değiştirmeyi deneyin</p>
                </div>
              </div>
            ) : (
              <div className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                  : "flex flex-col gap-3"
              }>
                {paged.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < 6}
                  />
                ))}
              </div>
            )}

            {/* Sayfalama */}
            <Pagination current={currentPage} total={totalPages} onPage={setPage} />
          </div>
        </div>
      </div>

      {/* ================================================================
          MOBİL FİLTRE DRAWER
          ================================================================ */}
      {mobileFilterOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-full bg-white border-r border-gray-200 overflow-y-auto p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-bold text-gray-900">Filtreler</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar />
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SAYFA BİLEŞENİ (default export)
// ---------------------------------------------------------------------------
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-48 bg-gray-200 rounded-xl mb-6 animate-pulse" />
        <FeaturedProductsSkeleton count={12} />
      </div>
    }>
      <ProductsPageInner />
    </Suspense>
  );
}
