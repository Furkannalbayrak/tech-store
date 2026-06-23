/**
 * components/home/CategoryGrid.tsx
 * ---------------------------------
 * Ürün kategorilerini vitrin şeklinde sunan grid bileşeni.
 * Server Component — statik veri, hiç state yok.
 *
 * TASARIM:
 *  - Her kart: gradient arka plan + büyük emoji ikon + overlay efekti
 *  - Hover'da ikon büyümesi ve parlama efekti
 *  - Masonry-style boyutlar: bazı kartlar iki sütun kaplar
 *  - Sağ tarafta "Tüm Kategoriler" özet kartı
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ---------------------------------------------------------------------------
// KATEGORİ VERİSİ
// ---------------------------------------------------------------------------
const CATEGORIES = [
  {
    id: "laptop",
    label: "Laptop & Notebook",
    description: "Ultra hafif tasarımdan güçlü workstation'lara",
    href: "/products?category=Laptop",
    emoji: "💻",
    gradient: "from-blue-600/80 to-blue-900/90",
    accentColor: "bg-blue-500/20",
    colSpan: "sm:col-span-2",
    rowSpan: "row-span-1",
    count: "1.240+",
  },
  {
    id: "smartphone",
    label: "Akıllı Telefon",
    description: "iOS ve Android'in en iyileri",
    href: "/products?category=Smartphone",
    emoji: "📱",
    gradient: "from-violet-600/80 to-violet-900/90",
    accentColor: "bg-violet-500/20",
    colSpan: "",
    rowSpan: "",
    count: "860+",
  },
  {
    id: "gpu",
    label: "Ekran Kartı",
    description: "Oyun ve yapay zeka workload'ları için",
    href: "/products?category=GPU",
    emoji: "🎮",
    gradient: "from-emerald-600/80 to-emerald-900/90",
    accentColor: "bg-emerald-500/20",
    colSpan: "",
    rowSpan: "",
    count: "320+",
  },
  {
    id: "monitor",
    label: "Monitör",
    description: "4K OLED'den ultra-wide'a her seçenek",
    href: "/products?category=Monitor",
    emoji: "🖥️",
    gradient: "from-cyan-600/80 to-cyan-900/90",
    accentColor: "bg-cyan-500/20",
    colSpan: "",
    rowSpan: "",
    count: "450+",
  },
  {
    id: "keyboard",
    label: "Klavye & Mouse",
    description: "Mekanik, sessiz ve kablosuz seçenekler",
    href: "/products?category=Keyboard",
    emoji: "⌨️",
    gradient: "from-rose-600/80 to-rose-900/90",
    accentColor: "bg-rose-500/20",
    colSpan: "",
    rowSpan: "",
    count: "580+",
  },
  {
    id: "tablet",
    label: "Tablet",
    description: "iPad'den Android tabletlere yaratıcı araçlar",
    href: "/products?category=Tablet",
    emoji: "📟",
    gradient: "from-amber-600/80 to-amber-900/90",
    accentColor: "bg-amber-500/20",
    colSpan: "",
    rowSpan: "",
    count: "290+",
  },
];

// ---------------------------------------------------------------------------
// ANA BİLEŞEN
// ---------------------------------------------------------------------------
export default function CategoryGrid() {
  return (
    <section className="py-20 bg-zinc-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Bölüm başlığı */}
        <div className="flex flex-col gap-2 mb-10">
          <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase">
            Ne Arıyorsunuz?
          </span>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Kategoriler
            </h2>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium
                         text-zinc-400 hover:text-white transition-colors group"
            >
              Tüm Ürünler
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" />
            </Link>
          </div>
        </div>

        {/* ================================================================
            KATEGORİ GRİD'İ
            ================================================================
            Responsive 2-sütun (mobil) / 4-sütun (masaüstü) ızgara.
            İlk kart (Laptop) 2 sütun kaplar — görsel ağırlık yaratır.
        ================================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px]">

          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              id={`category-card-${cat.id}`}
              className={`
                group relative overflow-hidden rounded-2xl
                bg-gradient-to-br ${cat.gradient}
                border border-white/5
                hover:border-white/15 hover:shadow-2xl hover:shadow-black/40
                hover:-translate-y-1
                transition-all duration-300 ease-out
                ${cat.colSpan}
                ${cat.rowSpan}
              `}
            >
              {/* Noktalı doku efekti */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              {/* Parlama efekti — hover'da güçlenir */}
              <div className={`
                absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl
                ${cat.accentColor}
                opacity-60 group-hover:opacity-100 group-hover:scale-125
                transition-all duration-500
              `} />

              {/* İçerik */}
              <div className="relative z-10 flex flex-col justify-between h-full p-5">

                {/* Üst: İkon + ürün sayısı */}
                <div className="flex items-start justify-between">
                  {/* Büyük emoji ikon */}
                  <span
                    className="text-4xl sm:text-5xl leading-none
                               group-hover:scale-110 transition-transform duration-300"
                  >
                    {cat.emoji}
                  </span>

                  {/* Ürün sayısı rozeti */}
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold
                                   bg-white/10 text-white/70 border border-white/10">
                    {cat.count}
                  </span>
                </div>

                {/* Alt: Başlık ve açıklama */}
                <div className="flex flex-col gap-1">
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>

                  {/* Hover'da beliren "Keşfet" linki */}
                  <div className="flex items-center gap-1 mt-1
                                  opacity-0 group-hover:opacity-100
                                  translate-y-1 group-hover:translate-y-0
                                  transition-all duration-300">
                    <span className="text-xs font-semibold text-white/80">Keşfet</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/80" />
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* ---- BONUS KART: Tüm Ürünler ---- */}
          <Link
            href="/products"
            id="category-card-all"
            className="group relative overflow-hidden rounded-2xl
                       bg-zinc-900 border border-zinc-800
                       hover:border-zinc-600 hover:shadow-xl
                       hover:-translate-y-1
                       transition-all duration-300
                       flex flex-col items-center justify-center gap-3"
          >
            {/* Arka plan gradient dairesi */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5
                            group-hover:from-blue-500/10 group-hover:to-violet-500/10
                            transition-all duration-500" />

            <div className="relative z-10 flex flex-col items-center gap-3 p-5 text-center">
              {/* Dört köşeli grid ikonu — "hepsini gör" sembolü */}
              <div className="grid grid-cols-2 gap-1.5 opacity-40 group-hover:opacity-70 transition-opacity">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-4 h-4 rounded bg-zinc-400" />
                ))}
              </div>

              <div>
                <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
                  Tüm Kategoriler
                </span>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  50.000+ ürün
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-blue-400 font-semibold
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Tümünü Gör <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        </div>

      </div>
    </section>
  );
}
