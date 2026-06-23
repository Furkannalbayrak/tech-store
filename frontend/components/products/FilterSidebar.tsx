"use client";

/**
 * components/products/FilterSidebar.tsx
 * ---------------------------------------
 * E-ticaret filtre paneli — URL param tabanlı durum yönetimi.
 *
 * FİLTRELER:
 *  1. Kategoriler — radio
 *  2. Markalar    — arama destekli checkbox listesi
 *  3. Fiyat Aralığı — min / max input
 *  4. Değerlendirme  — minimum yıldız seçimi
 *  5. Sadece İndirimdekiler — toggle
 *  6. Hızlı Teslimat — toggle
 *
 * URL Param Sözleşmesi:
 *   ?category=Laptop&brand=Apple,ASUS&minPrice=10000&maxPrice=100000
 *   &minRating=4&onlyDiscount=1&fastDelivery=1
 */

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from "lucide-react";

// ---------------------------------------------------------------------------
// STATİK VERİ
// ---------------------------------------------------------------------------
const CATEGORIES = [
  "Laptop", "Akıllı Telefon", "Ekran Kartı", "Monitör",
  "Klavye & Mouse", "Tablet", "Kulaklık", "SSD & Depolama",
  "RAM", "Anakart", "İşlemci", "Soğutma", "Güç Kaynağı",
];

const BRANDS = [
  "Apple", "Samsung", "ASUS", "MSI", "Lenovo", "Dell", "HP",
  "NVIDIA", "AMD", "Intel", "LG", "Sony", "Razer", "Logitech",
  "Keychron", "Kingston", "WD", "Xiaomi", "HyperX", "Corsair",
];

const RATING_OPTIONS = [
  { label: "4★ ve üzeri", value: 4 },
  { label: "3★ ve üzeri", value: 3 },
  { label: "2★ ve üzeri", value: 2 },
];

// ---------------------------------------------------------------------------
// YARDIMCI HOOK — URL parametrelerini oku/yaz
// ---------------------------------------------------------------------------
function useFilterParams() {
  const router = useRouter();
  const params = useSearchParams();

  const get = (key: string) => params.get(key) ?? "";
  const getList = (key: string) => get(key) ? get(key).split(",") : [];
  const getNum = (key: string) => { const v = get(key); return v ? parseInt(v) : undefined; };

  const set = (updates: Record<string, string | null>) => {
    const p = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === "") p.delete(k);
      else p.set(k, v);
    });
    p.delete("page"); // Filtre değişince sayfayı sıfırla
    router.push(`?${p.toString()}`);
  };

  return { get, getList, getNum, set };
}

// ---------------------------------------------------------------------------
// AÇILIР PANEL (Accordion)
// ---------------------------------------------------------------------------
function Accordion({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ANA BİLEŞEN
// ---------------------------------------------------------------------------
interface FilterSidebarProps {
  className?: string;
}

export default function FilterSidebar({ className }: FilterSidebarProps) {
  const { get, getList, getNum, set } = useFilterParams();
  const [isPending, startTransition] = useTransition();
  const [brandSearch, setBrandSearch] = useState("");

  const selectedCategory = get("category");
  const selectedBrands   = getList("brand");
  const minPrice = getNum("minPrice");
  const maxPrice = getNum("maxPrice");
  const minRating = getNum("minRating");
  const onlyDiscount   = get("onlyDiscount") === "1";
  const fastDelivery   = get("fastDelivery") === "1";

  // Aktif filtre sayısını hesapla (badge için)
  const activeCount = [
    selectedCategory, selectedBrands.length > 0, minPrice, maxPrice,
    minRating, onlyDiscount, fastDelivery
  ].filter(Boolean).length;

  const update = (key: string, val: string | null) => {
    startTransition(() => set({ [key]: val }));
  };

  // Marka toggle
  const toggleBrand = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    startTransition(() => set({ brand: next.length ? next.join(",") : null }));
  };

  // Tüm filtreleri temizle
  const clearAll = () => {
    startTransition(() => {
      const p = new URLSearchParams();
      window.location.href = `?${p.toString()}`;
    });
  };

  const filteredBrands = BRANDS.filter(b =>
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <aside
      className={`flex flex-col gap-0 ${isPending ? "opacity-60" : ""} transition-opacity ${className ?? ""}`}
    >
      {/* ---- BAŞLIK ---- */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold text-gray-900">Filtreler</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <X className="w-3 h-3" /> Temizle
          </button>
        )}
      </div>

      {/* ================================================================
          1. KATEGORİLER
          ================================================================ */}
      <Accordion title="Kategori">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => update("category", null)}
            className={`text-left px-2 py-1.5 rounded-lg text-sm transition-all ${
              !selectedCategory
                ? "bg-blue-50 text-blue-600 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Tüm Kategoriler
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => update("category", selectedCategory === cat ? null : cat)}
              className={`text-left px-2 py-1.5 rounded-lg text-sm transition-all ${
                selectedCategory === cat
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Accordion>

      {/* ================================================================
          2. MARKALAR
          ================================================================ */}
      <Accordion title="Marka">
        <input
          type="text"
          value={brandSearch}
          onChange={e => setBrandSearch(e.target.value)}
          placeholder="Marka ara..."
          className="w-full mb-2 px-3 py-2 rounded-lg text-xs bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
        <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1 custom-scroll">
          {filteredBrands.map(brand => {
            const checked = selectedBrands.includes(brand);
            return (
              <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => toggleBrand(brand)}
                  className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                    checked
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-300 group-hover:border-blue-400"
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
                  className={`text-sm transition-colors cursor-pointer ${checked ? "text-blue-600 font-semibold" : "text-gray-600 group-hover:text-gray-900"}`}
                >
                  {brand}
                </span>
              </label>
            );
          })}
        </div>
      </Accordion>

      {/* ================================================================
          3. FİYAT ARALIĞI
          ================================================================ */}
      <Accordion title="Fiyat Aralığı (₺)">
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            defaultValue={minPrice}
            onBlur={e => update("minPrice", e.target.value || null)}
            className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <span className="text-gray-400 flex-shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice}
            onBlur={e => update("maxPrice", e.target.value || null)}
            className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        {/* Hızlı fiyat aralıkları */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[
            { label: "0–5K", min: "0", max: "5000" },
            { label: "5K–20K", min: "5000", max: "20000" },
            { label: "20K–60K", min: "20000", max: "60000" },
            { label: "60K+", min: "60000", max: null },
          ].map(r => (
            <button
              key={r.label}
              onClick={() => startTransition(() => set({ minPrice: r.min, maxPrice: r.max }))}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all"
            >
              {r.label}
            </button>
          ))}
        </div>
      </Accordion>

      {/* ================================================================
          4. DEĞERLENDİRME PUANI
          ================================================================ */}
      <Accordion title="Değerlendirme Puanı" defaultOpen={false}>
        <div className="flex flex-col gap-2">
          {RATING_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => update("minRating", minRating === opt.value ? null : String(opt.value))}
                className={`w-4 h-4 rounded-full border flex-shrink-0 transition-all cursor-pointer ${
                  minRating === opt.value
                    ? "bg-amber-500 border-amber-500"
                    : "bg-white border-gray-300 group-hover:border-amber-400"
                }`}
              >
                {minRating === opt.value && (
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                )}
              </div>
              <span
                onClick={() => update("minRating", minRating === opt.value ? null : String(opt.value))}
                className={`text-sm cursor-pointer ${minRating === opt.value ? "text-amber-600 font-semibold" : "text-gray-600 group-hover:text-gray-900"}`}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </Accordion>

      {/* ================================================================
          5. SADECE İNDİRİMDEKİLER / HIZLI TESLİMAT
          ================================================================ */}
      <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 mt-2">
        {/* İndirim toggle */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 font-medium">🏷️ Sadece İndirimdekiler</span>
          <div
            onClick={() => update("onlyDiscount", onlyDiscount ? null : "1")}
            className={`relative w-10 h-5 rounded-full transition-all cursor-pointer ${onlyDiscount ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${onlyDiscount ? "left-5" : "left-0.5"}`} />
          </div>
        </label>

        {/* Hızlı teslimat toggle */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 font-medium">⚡ Hızlı Teslimat</span>
          <div
            onClick={() => update("fastDelivery", fastDelivery ? null : "1")}
            className={`relative w-10 h-5 rounded-full transition-all cursor-pointer ${fastDelivery ? "bg-emerald-500" : "bg-gray-300"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${fastDelivery ? "left-5" : "left-0.5"}`} />
          </div>
        </label>
      </div>
    </aside>
  );
}
