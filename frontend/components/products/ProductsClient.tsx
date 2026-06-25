"use client";

/**
 * components/products/ProductsClient.tsx
 * ─────────────────────────────────────────────
 * Ürün listeleme sayfasının tüm istemci tarafı mantığını içerir.
 *
 * Server'dan gelen 48 ürün bu bileşende:
 *  1. URL parametrelerine göre filtrelenir (category, brand, price, discount)
 *  2. Sıralanır (price-asc, price-desc, newest, discount-desc)
 *  3. Sayfalanır (12 ürün/sayfa, client-side)
 *  4. Grid veya liste görünümünde render edilir
 *
 * DİNAMİK FILTRE PANELİ:
 *  DynamicFilterSidebar, tüm (filtrelenmemiş) ürün listesini alır ve
 *  o listeden markaları otomatik olarak türetir. Böylece sayfada
 *  sadece gerçekte var olan markalar görünür.
 */

import { useState, useMemo, useCallback, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  SlidersHorizontal, X, Grid3X3, LayoutList,
  ChevronLeft, ChevronRight, ArrowUpDown, PackageSearch,
  AlertCircle, Home
} from "lucide-react";
import ProductCard from "@/components/home/ProductCard";
import DynamicFilterSidebar from "@/components/products/DynamicFilterSidebar";
import type { ProductSummary } from "@/lib/types/api.types";

/* ============================================================
   SABİTLER
   ============================================================ */
const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "default",       label: "Önerilen" },
  { value: "price-asc",     label: "Fiyat: Düşükten Yükseğe" },
  { value: "price-desc",    label: "Fiyat: Yüksekten Düşüğe" },
  { value: "newest",        label: "En Yeniler" },
  { value: "discount-desc", label: "En Yüksek İndirim" },
];

/* ============================================================
   CLIENT-SIDE FİLTRE + SIRALAMA
   ============================================================ */
function applyClientFilters(
  products: ProductSummary[],
  params: URLSearchParams
): ProductSummary[] {
  let result = [...products];

  const category    = params.get("category");
  const brands      = params.get("brand")?.split(",").filter(Boolean) ?? [];
  const keyword     = params.get("keyword")?.toLowerCase();
  const minPrice    = params.get("minPrice") ? Number(params.get("minPrice")) : null;
  const maxPrice    = params.get("maxPrice") ? Number(params.get("maxPrice")) : null;
  const onlyDiscount = params.get("onlyDiscount") === "1";
  const sort        = params.get("sort") ?? "default";

  /* Kategori filtresi (server'dan herkesi çektik, burada daraltıyoruz) */
  if (category)
    result = result.filter(p =>
      p.category?.toLowerCase() === category.toLowerCase()
    );

  /* Marka filtresi */
  if (brands.length)
    result = result.filter(p => brands.includes(p.brand ?? ""));

  /* Arama filtresi */
  if (keyword)
    result = result.filter(p =>
      p.name.toLowerCase().includes(keyword) ||
      p.brand?.toLowerCase().includes(keyword) ||
      p.category?.toLowerCase().includes(keyword)
    );

  /* Fiyat filtresi (indirimli fiyatı önceliklendir) */
  if (minPrice != null)
    result = result.filter(p => (p.discountedPrice ?? p.price) >= minPrice);
  if (maxPrice != null)
    result = result.filter(p => (p.discountedPrice ?? p.price) <= maxPrice);

  /* Sadece indirimli */
  if (onlyDiscount)
    result = result.filter(p => p.discountedPrice != null);

  /* Sıralama */
  result.sort((a, b) => {
    const pa = a.discountedPrice ?? a.price;
    const pb = b.discountedPrice ?? b.price;
    const da = a.discountedPrice
      ? Math.round(((a.price - a.discountedPrice) / a.price) * 100) : 0;
    const db = b.discountedPrice
      ? Math.round(((b.price - b.discountedPrice) / b.price) * 100) : 0;

    switch (sort) {
      case "price-asc":    return pa - pb;
      case "price-desc":   return pb - pa;
      case "discount-desc":return db - da;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }
  });

  return result;
}

/* ============================================================
   AKTİF FİLTRE CHİPLERİ
   ============================================================ */
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

  (params.get("brand")?.split(",").filter(Boolean) ?? []).forEach(b =>
    chips.push({ label: b, onRemove: () => remove("brand", b) })
  );

  const minP = params.get("minPrice"), maxP = params.get("maxPrice");
  if (minP || maxP) chips.push({
    label: `₺${Number(minP || 0).toLocaleString("tr-TR")} – ₺${maxP ? Number(maxP).toLocaleString("tr-TR") : "∞"}`,
    onRemove: () => { remove("minPrice"); remove("maxPrice"); },
  });

  const mr = params.get("minRating");
  if (mr) chips.push({ label: `${mr}★ ve üzeri`, onRemove: () => remove("minRating") });

  if (params.get("onlyDiscount") === "1")
    chips.push({ label: "Sadece İndirimli", onRemove: () => remove("onlyDiscount") });

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={chip.onRemove}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                     bg-blue-50 text-blue-700 border border-blue-200
                     hover:bg-red-50 hover:text-red-600 hover:border-red-200
                     transition-all duration-150"
        >
          {chip.label}
          <X className="w-3 h-3" />
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   SAYFALAMA
   ============================================================ */
function Pagination({ current, total, onPage }: {
  current: number; total: number; onPage: (p: number) => void;
}) {
  if (total <= 1) return null;

  const getPages = () => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, -1, total];
    if (current >= total - 3) return [1, -1, total - 4, total - 3, total - 2, total - 1, total];
    return [1, -1, current - 1, current, current + 1, -1, total];
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onPage(current - 1)}
        disabled={current === 1}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPages().map((p, i) =>
        p === -1 ? (
          <span key={`dot-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
              p === current
                ? "bg-blue-600 text-white shadow shadow-blue-300"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        )
      )}

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

/* ============================================================
   İSKELET (loading)
   ============================================================ */
function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-100" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-1/2 mt-1" />
            <div className="h-8 bg-gray-200 rounded mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   ANA BİLEŞEN — PROPS
   ============================================================ */
interface ProductsClientProps {
  initialProducts: ProductSummary[];
  totalElements: number;
  isPlaceholder: boolean;
  initialCategory?: string;
  initialKeyword?: string;
  initialSort?: string;
  initialPage?: number;
}

/* ============================================================
   ANA BİLEŞEN
   ============================================================ */
export default function ProductsClient({
  initialProducts,
  totalElements,
  isPlaceholder,
  initialCategory,
  initialSort,
  initialPage = 1,
}: ProductsClientProps) {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const [, startTransition] = useTransition();

  const [mobileFilterOpen, setMobileFilter] = useState(false);

  const currentPage = Number(searchParams.get("page") ?? String(initialPage));
  const sort        = searchParams.get("sort") ?? initialSort ?? "default";
  const category    = searchParams.get("category") ?? initialCategory;

  /* ---- Client-side filtreleme ---- */
  const filtered = useMemo(
    () => applyClientFilters(initialProducts, searchParams),
    [initialProducts, searchParams]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  /* ---- Sayfa değiştir ---- */
  const setPage = useCallback((p: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(p));
      router.push(`?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [searchParams, router]);

  /* ---- Sıralama değiştir ---- */
  const setSort = useCallback((s: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", s);
    params.delete("page");
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="max-w-[1340px] mx-auto px-4 py-6">

      {/* ---- BREADCRUMB ---- */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-700 flex items-center gap-1">
          <Home className="w-3 h-3" /> Ana Sayfa
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/products" className="hover:text-blue-700">Ürünler</Link>
        {category && (
          <>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-800 font-medium">{category}</span>
          </>
        )}
      </nav>

      {/* ---- SAYFA BAŞLIĞI ---- */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          {category ?? "Tüm Ürünler"}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {filtered.length.toLocaleString("tr-TR")} ürün
          {totalElements > initialProducts.length && (
            <span className="text-gray-400"> (toplam {totalElements.toLocaleString("tr-TR")} ürün içinden gösteriliyor)</span>
          )}
        </p>
      </div>

      {/* ---- PLACEHOLDER UYARISI ---- */}
      {isPlaceholder && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Geliştirme Modu:</span> Backend çevrimdışı, örnek veriler gösteriliyor.
          </p>
        </div>
      )}

      <div className="flex gap-6">

        {/* ================================================================
            SOL: FİLTRE PANELİ (masaüstü)
            ================================================================ */}
        <div className="hidden lg:block w-60 flex-shrink-0">
          <div className="sticky top-[120px] bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <DynamicFilterSidebar products={initialProducts} />
          </div>
        </div>

        {/* ================================================================
            SAĞ: ÜRÜN ALANI
            ================================================================ */}
        <div className="flex-1 min-w-0">

          {/* ---- ARAÇ ÇUBUĞU ---- */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap bg-white border border-gray-200 rounded-lg px-4 py-2.5">

            <div className="flex items-center gap-2">
              {/* Mobil filtre butonu */}
              <button
                onClick={() => setMobileFilter(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                           border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-700 bg-white transition-all"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtreler
              </button>

              {/* Sıralama */}
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-400 hidden sm:inline">Sırala:</span>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="text-sm text-gray-800 bg-transparent focus:outline-none cursor-pointer font-medium"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value} className="bg-white">{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Görünüm modu kaldırıldı (her zaman grid) */}
          </div>

          {/* ---- AKTİF FİLTRE CHİPLERİ ---- */}
          <ActiveFilterChips params={searchParams} />

          {/* ---- ÜRÜN ALANI ---- */}
          {paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center
                            bg-white rounded-lg border border-gray-200">
              <PackageSearch className="w-16 h-16 text-gray-300" strokeWidth={1} />
              <div>
                <p className="text-lg font-semibold text-gray-800">Ürün bulunamadı</p>
                <p className="text-sm text-gray-500 mt-1">Filtrelerinizi değiştirmeyi veya temizlemeyi deneyin</p>
              </div>
              <Link
                href="/products"
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tüm Ürünlere Dön
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {paged.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={idx < 8}
                />
              ))}
            </div>
          )}

          {/* ---- SAYFALAMA ---- */}
          <Pagination current={currentPage} total={totalPages} onPage={setPage} />
        </div>
      </div>

      {/* ================================================================
          MOBİL FİLTRE DRAWER
          ================================================================ */}
      {mobileFilterOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFilter(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <span className="text-base font-bold text-gray-900">Filtreler</span>
              <button
                onClick={() => setMobileFilter(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <DynamicFilterSidebar products={initialProducts} />
            </div>
            {/* Uygula butonu */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-3">
              <button
                onClick={() => setMobileFilter(false)}
                className="w-full py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                {filtered.length} Ürünü Gör
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
