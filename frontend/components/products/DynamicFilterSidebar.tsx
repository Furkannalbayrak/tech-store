"use client";

/**
 * components/products/DynamicFilterSidebar.tsx
 * ─────────────────────────────────────────────
 * Vatan Bilgisayar / Hepsiburada tarzı dinamik filtre paneli.
 *
 * DİNAMİK MARKA LİSTESİ:
 *  Sabit (hardcoded) marka listesi YOK.
 *  Gelen ürün listesinden markaları ayıklayıp her birinin ürün sayısıyla
 *  birlikte checkbox olarak listeler.
 *
 * FİLTRE TİPLERİ:
 *  1. Marka       — checkbox (çoklu seçim, ürün sayılı)
 *  2. Fiyat Aralığı — min/max input + hızlı aralık butonları
 *  3. İndirim     — toggle
 *  4. Değerlendirme — minimum yıldız (sadece istatistiksel, gerçek veri yok)
 *
 * TÜM DEĞİŞİKLİKLER URL PARAM ÜZERINDEN YÖNETILIR:
 *  ?brand=Apple,Samsung&minPrice=5000&maxPrice=50000&onlyDiscount=1
 */

import { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import type { ProductSummary } from "@/lib/types/api.types";

/* ============================================================
   ACCORDION BİLEŞENİ
   ============================================================ */
function Accordion({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-gray-900 hover:text-blue-700 transition-colors"
      >
        {title}
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />
        }
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}

/* ============================================================
   PROPS
   ============================================================ */
interface DynamicFilterSidebarProps {
  products: ProductSummary[];  // Tüm (filtrelenmemiş) ürün listesi
  className?: string;
}

/* ============================================================
   ANA BİLEŞEN
   ============================================================ */
export default function DynamicFilterSidebar({
  products,
  className,
}: DynamicFilterSidebarProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [brandSearch, setBrandSearch] = useState("");

  /* ---- URL'den mevcut filtre değerlerini oku ---- */
  const selectedBrands  = useMemo(
    () => searchParams.get("brand")?.split(",").filter(Boolean) ?? [],
    [searchParams]
  );
  const minPrice    = searchParams.get("minPrice");
  const maxPrice    = searchParams.get("maxPrice");
  const minRating   = searchParams.get("minRating");
  const onlyDiscount = searchParams.get("onlyDiscount") === "1";

  /* ---- Aktif filtre sayısı (badge) ---- */
  const activeCount = [
    selectedBrands.length > 0,
    minPrice,
    maxPrice,
    minRating,
    onlyDiscount,
  ].filter(Boolean).length;

  /* ============================================================
     DİNAMİK MARKA LİSTESİ
     Gelen ürün listesinden markalar ve ürün sayıları türetilir.
     ============================================================ */
  const brandMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      if (!p.brand) continue;
      map.set(p.brand, (map.get(p.brand) ?? 0) + 1);
    }
    // Ürün sayısına göre azalan sırala
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1]);
  }, [products]);

  const filteredBrands = useMemo(
    () => brandMap.filter(([name]) =>
      name.toLowerCase().includes(brandSearch.toLowerCase())
    ),
    [brandMap, brandSearch]
  );

  /* ============================================================
     URL GÜNCELLEME YARDIMCILARI
     ============================================================ */
  const updateParams = (updates: Record<string, string | null>) => {
    startTransition(() => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === "") p.delete(k);
        else p.set(k, v);
      });
      p.delete("page");
      router.push(`?${p.toString()}`);
    });
  };

  const toggleBrand = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    updateParams({ brand: next.length ? next.join(",") : null });
  };

  const clearAll = () => {
    startTransition(() => {
      const p = new URLSearchParams();
      // category ve keyword'ü koru
      const cat = searchParams.get("category");
      const kw  = searchParams.get("keyword");
      const sortV = searchParams.get("sort");
      if (cat)   p.set("category", cat);
      if (kw)    p.set("keyword", kw);
      if (sortV) p.set("sort", sortV);
      router.push(`?${p.toString()}`);
    });
  };

  return (
    <aside
      className={`flex flex-col gap-0 transition-opacity ${isPending ? "opacity-60" : ""} ${className ?? ""}`}
    >
      {/* ---- BAŞLIK SATIRI ---- */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-700" />
          <span className="text-sm font-bold text-gray-900">Filtreler</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors font-medium"
          >
            <X className="w-3 h-3" /> Temizle
          </button>
        )}
      </div>

      {/* ================================================================
          MARKA FİLTRESİ — DİNAMİK
          ================================================================ */}
      {brandMap.length > 0 && (
        <Accordion title={`Marka (${brandMap.length})`}>
          {/* Arama kutusu — 5'ten fazla marka varsa göster */}
          {brandMap.length > 5 && (
            <input
              type="text"
              value={brandSearch}
              onChange={e => setBrandSearch(e.target.value)}
              placeholder="Marka ara..."
              className="w-full mb-2 px-3 py-2 rounded-lg text-xs bg-gray-50 border border-gray-200
                         text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          )}

          <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto pr-1">
            {filteredBrands.map(([brand, count]) => {
              const checked = selectedBrands.includes(brand);
              return (
                <label
                  key={brand}
                  className="flex items-center gap-2.5 px-1 py-1.5 rounded-lg cursor-pointer group hover:bg-gray-50 transition-colors"
                >
                  {/* Özel checkbox */}
                  <div
                    onClick={() => toggleBrand(brand)}
                    className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                      checked
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300 group-hover:border-blue-400"
                    }`}
                  >
                    {checked && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  <span
                    onClick={() => toggleBrand(brand)}
                    className={`flex-1 text-sm transition-colors cursor-pointer ${
                      checked ? "text-blue-700 font-semibold" : "text-gray-700 group-hover:text-gray-900"
                    }`}
                  >
                    {brand}
                  </span>

                  <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    {count}
                  </span>
                </label>
              );
            })}

            {filteredBrands.length === 0 && brandSearch && (
              <p className="text-xs text-gray-400 py-2 text-center">"{brandSearch}" bulunamadı</p>
            )}
          </div>
        </Accordion>
      )}

      {/* ================================================================
          FİYAT ARALIĞI
          ================================================================ */}
      <Accordion title="Fiyat Aralığı (₺)">
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            defaultValue={minPrice ?? ""}
            onBlur={e => updateParams({ minPrice: e.target.value || null })}
            className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 border border-gray-200
                       text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <span className="text-gray-400 flex-shrink-0 text-sm">—</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice ?? ""}
            onBlur={e => updateParams({ maxPrice: e.target.value || null })}
            className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 border border-gray-200
                       text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Hızlı aralık butonları */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {[
            { label: "0–5K",    min: "0",     max: "5000"  },
            { label: "5K–20K",  min: "5000",  max: "20000" },
            { label: "20K–50K", min: "20000", max: "50000" },
            { label: "50K+",    min: "50000", max: null     },
          ].map(r => (
            <button
              key={r.label}
              onClick={() => updateParams({ minPrice: r.min, maxPrice: r.max })}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                minPrice === r.min && maxPrice === r.max
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </Accordion>

      {/* ================================================================
          SADECE İNDİRİMLİ TOGGLE
          ================================================================ */}
      <div className="flex flex-col gap-3 pt-4">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-800 font-medium">🏷️ Sadece İndirimdekiler</span>
          <div
            onClick={() => updateParams({ onlyDiscount: onlyDiscount ? null : "1" })}
            className={`relative w-10 h-5 rounded-full transition-all cursor-pointer ${
              onlyDiscount ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
              onlyDiscount ? "left-5" : "left-0.5"
            }`} />
          </div>
        </label>

        {/* Değerlendirme puanı */}
        <Accordion title="Değerlendirme Puanı" defaultOpen={false}>
          <div className="flex flex-col gap-2">
            {[4, 3, 2].map(rating => (
              <label key={rating} className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => updateParams({
                    minRating: minRating === String(rating) ? null : String(rating)
                  })}
                  className={`w-4 h-4 rounded-full border flex-shrink-0 transition-all cursor-pointer flex items-center justify-center ${
                    minRating === String(rating)
                      ? "bg-amber-500 border-amber-500"
                      : "border-gray-300 group-hover:border-amber-500"
                  }`}
                >
                  {minRating === String(rating) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <span
                  onClick={() => updateParams({
                    minRating: minRating === String(rating) ? null : String(rating)
                  })}
                  className={`text-sm cursor-pointer ${
                    minRating === String(rating)
                      ? "text-amber-600 font-semibold"
                      : "text-gray-700 group-hover:text-gray-900"
                  }`}
                >
                  {rating}★ ve üzeri
                </span>
              </label>
            ))}
          </div>
        </Accordion>
      </div>
    </aside>
  );
}
