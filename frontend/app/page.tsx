/**
 * app/page.tsx
 * ----------------------------------------
 * TechStore Anasayfası — Amazon/Vatan Bilgisayar tarzı mega market vitrini.
 *
 * SAYFA YAPISI (yukarıdan aşağı):
 *  1. BannerSlider    — Kampanya slider'ı
 *  2. Çok Satanlar    — 8 öne çıkan ürün
 *  3. Markalar Barı   — Brand logoları
 *  4. Laptop Fırsatları  — Kategori ürün bandı
 *  5. Telefon & Tablet   — Kategori ürün bandı
 *  6. Promosyon CTA   — Alt bant
 *
 * Server Component: BannerSlider hariç tüm bölümler SSR/SSG ile render edilir.
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import BannerSlider from "@/components/home/BannerSlider";
import ProductCard from "@/components/home/ProductCard";
import { PLACEHOLDER_SUMMARY_PRODUCTS } from "@/lib/data/placeholder-products";

/* ============================================================
   SEO
   ============================================================ */
export const metadata: Metadata = {
  title: "TechStore — Laptop, Telefon, PC Bileşeni ve Daha Fazlası",
  description:
    "Türkiye'nin en büyük teknoloji hipermarketi. 50.000+ ürün, en düşük fiyat garantisi, hızlı teslimat.",
};

/* ============================================================
   STATİK VERİ
   ============================================================ */
const BRANDS = [
  { name: "Apple", color: "#111111" },
  { name: "Samsung", color: "#1428A0" },
  { name: "ASUS", color: "#00539B" },
  { name: "MSI", color: "#E22028" },
  { name: "Lenovo", color: "#E2231A" },
  { name: "Sony", color: "#111111" },
  { name: "LG", color: "#A50034" },
  { name: "Dell", color: "#007DB8" },
  { name: "HP", color: "#0096D6" },
  { name: "NVIDIA", color: "#76B900" },
  { name: "AMD", color: "#ED1C24" },
  { name: "Logitech", color: "#00B8FC" },
];

const TRUST_ITEMS = [
  { Icon: Truck, title: "Ücretsiz Kargo", sub: "300₺ ve üzeri alışverişlerde" },
  { Icon: ShieldCheck, title: "Güvenli Ödeme", sub: "256-bit SSL şifrelemeli" },
  { Icon: RotateCcw, title: "30 Gün İade", sub: "Koşulsuz iade garantisi" },
  { Icon: Headphones, title: "7/24 Destek", sub: "Her zaman yanınızdayız" },
];

/* ============================================================
   YARDIMCI: Bölüm Başlığı
   ============================================================ */
function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "Tümünü Gör",
}: {
  title: string;
  subtitle?: string;
  href: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <Link
        href={href}
        className="flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors flex-shrink-0"
      >
        {linkLabel}
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

/* ============================================================
   ANA SAYFA
   ============================================================ */
export default function HomePage() {
  /* Placeholder veriden kategori bazlı seçimler */
  const bestsellers = PLACEHOLDER_SUMMARY_PRODUCTS
    .filter(p => p.isFeatured)
    .concat(PLACEHOLDER_SUMMARY_PRODUCTS.filter(p => !p.isFeatured))
    .slice(0, 8);

  const laptops = PLACEHOLDER_SUMMARY_PRODUCTS
    .filter(p => p.category === "Laptop")
    .slice(0, 6);

  const phones = PLACEHOLDER_SUMMARY_PRODUCTS
    .filter(p => p.category === "Akıllı Telefon")
    .slice(0, 6);

  const discounted = PLACEHOLDER_SUMMARY_PRODUCTS
    .filter(p => p.discountedPrice != null)
    .slice(0, 8);

  return (
    <div className="max-w-[1340px] mx-auto px-4 pb-10">

      {/* ============================================================
          1. BANNER SLIDER
          ============================================================ */}
      <section className="mt-4 mb-6">
        <Suspense fallback={<div className="w-full h-[280px] bg-gray-200 rounded-lg animate-pulse" />}>
          <BannerSlider />
        </Suspense>
      </section>

      {/* ============================================================
          2. GÜVEN ÇUBUĞU
          ============================================================ */}
      <section className="mb-6 bg-white border border-gray-200 rounded-lg">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-200">
          {TRUST_ITEMS.map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 px-5 py-4">
              <Icon className="w-7 h-7 text-blue-700 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="text-[11px] text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          3. ÇOK SATANLAR
          ============================================================ */}
      <section className="mb-8 bg-white border border-gray-200 rounded-lg p-5">
        <SectionHeader
          title="Çok Satanlar"
          subtitle="Bu hafta en çok tercih edilen ürünler"
          href="/products"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
          {bestsellers.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      </section>

      {/* ============================================================
          4. MARKA LOGOSU BANDI
          ============================================================ */}
      <section className="mb-8 bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Popüler Markalar</h2>
          <Link href="/products" className="text-sm font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1">
            Tüm Markalar <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3">
          {BRANDS.map(brand => (
            <Link
              key={brand.name}
              href={`/products?brand=${brand.name}`}
              className="flex items-center justify-center px-2 py-3 bg-gray-50 border border-gray-200 rounded-lg
                         hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm transition-all"
            >
              <span
                className="text-xs font-extrabold tracking-tight"
                style={{ color: brand.color }}
              >
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================
          5. LAPTOP FIRSATLARI
          ============================================================ */}
      <section className="mb-8 bg-white border border-gray-200 rounded-lg p-5">
        <SectionHeader
          title="💻 Laptop Fırsatları"
          subtitle="En güçlü modeller, en uygun fiyatlarla"
          href="/products?category=Laptop"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {laptops.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={false} />
          ))}
        </div>
      </section>

      {/* ============================================================
          6. TELEFON & TABLET
          ============================================================ */}
      <section className="mb-8 bg-white border border-gray-200 rounded-lg p-5">
        <SectionHeader
          title="📱 Telefon & Tablet Kampanyaları"
          subtitle="iPhone, Samsung, Xiaomi ve daha fazlası"
          href="/products?category=Ak%C4%B1ll%C4%B1+Telefon"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {phones.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={false} />
          ))}
        </div>
      </section>

      {/* ============================================================
          7. KATEGORİ GRİDİ (Hızlı Erişim)
          ============================================================ */}
      <section className="mb-8 bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Kategorilere Göz At</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Laptop", emoji: "💻", href: "/products?category=Laptop" },
            { label: "Telefon", emoji: "📱", href: "/products?category=Ak%C4%B1ll%C4%B1+Telefon" },
            { label: "Ekran Kartı", emoji: "🎮", href: "/products?category=Ekran+Kart%C4%B1" },
            { label: "Monitör", emoji: "🖥️", href: "/products?category=Monit%C3%B6r" },
            { label: "Kulaklık", emoji: "🎧", href: "/products?category=Kulakl%C4%B1k" },
            { label: "SSD", emoji: "💾", href: "/products?category=SSD+%26+Depolama" },
            { label: "Aksesuarlar", emoji: "🖱️", href: "/products?category=Aksesuarlar" },
          ].map(cat => (
            <Link
              key={cat.label}
              href={cat.href}
              className="flex flex-col items-center gap-2 py-4 bg-gray-50 border border-gray-200 rounded-lg
                         hover:bg-blue-50 hover:border-blue-400 hover:shadow-sm transition-all group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.emoji}</span>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-700 text-center">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================
          8. İNDİRİMLİ ÜRÜNLER
          ============================================================ */}
      <section className="mb-8 bg-white border border-gray-200 rounded-lg p-5">
        <SectionHeader
          title="🏷️ İndirimli Ürünler"
          subtitle="Fiyatlar düştü, kaçırmayın!"
          href="/products?onlyDiscount=1"
          linkLabel="Tüm İndirimler"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
          {discounted.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={false} />
          ))}
        </div>
      </section>

      {/* ============================================================
          9. ALT KAMPANYA BANDI
          ============================================================ */}
      <section className="rounded-lg overflow-hidden bg-gradient-to-r from-blue-700 to-blue-900 p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              Tüm Ürünler — 50.000+ Çeşit
            </h2>
            <p className="text-blue-200 text-sm mt-1">
              En geniş teknoloji ürünleri kataloğunu keşfedin. Ücretsiz kargo, kolay iade.
            </p>
          </div>
          <Link
            href="/products"
            id="homepage-all-products-btn"
            className="flex-shrink-0 px-8 py-3 bg-white text-blue-800 font-extrabold text-base rounded
                       hover:bg-gray-100 transition-colors shadow-lg"
          >
            Alışverişe Başla →
          </Link>
        </div>
      </section>

    </div>
  );
}
