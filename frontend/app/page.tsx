/**
 * app/page.tsx
 * ----------------------------------------
 * TechStore Anasayfası — Gerçek backend verisiyle çalışan dinamik sayfa.
 *
 * MİMARİ:
 *  - Her bölüm bağımsız bir async Server Component veya Suspense sarmalı.
 *  - Backend offline olursa hata vermez, sessizce placeholder kullanır.
 *  - React Streaming sayesinde hazır bölümler hemen görünür (fallback iskeletleriyle).
 *
 * VERİ AKIŞI:
 *  Backend: GET /api/v1/products/featured   → "Çok Satanlar"
 *  Backend: GET /api/v1/products?category=X → Kategori bölümleri
 *  Backend: GET /api/v1/products/categories → Marka logoları (kategori sayıları)
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import BannerSlider from "@/components/home/BannerSlider";
import ProductCard from "@/components/home/ProductCard";
import {
  getFeaturedProducts,
  getProducts,
  getCategories,
} from "@/lib/api/product.service";
import { PLACEHOLDER_SUMMARY_PRODUCTS } from "@/lib/data/placeholder-products";
import type { ProductSummary, CategoryInfo } from "@/lib/types/api.types";

/* ============================================================
   SEO
   ============================================================ */
export const metadata: Metadata = {
  title: "TechStore — Laptop, Telefon, PC Bileşeni ve Daha Fazlası",
  description:
    "Türkiye'nin en büyük teknoloji hipermarketi. 50.000+ ürün, en düşük fiyat garantisi, hızlı teslimat.",
};

/* ============================================================
   STATİK
   ============================================================ */
const TRUST_ITEMS = [
  { Icon: Truck, title: "Ücretsiz Kargo", sub: "300₺ ve üzeri alışverişlerde" },
  { Icon: ShieldCheck, title: "Güvenli Ödeme", sub: "256-bit SSL şifreli" },
  { Icon: RotateCcw, title: "30 Gün İade", sub: "Koşulsuz iade garantisi" },
  { Icon: Headphones, title: "7/24 Destek", sub: "Her zaman yanınızdayız" },
];

const CATEGORY_IMAGES: Record<string, string> = {
  "Dizüstü Bilgisayar": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcyWn47o_pHCoaGFDiwpzTxNdocgqbHdUPmXj8IG8hHP5vxW6ShWDTUk01&s=10",
  "Akıllı Telefon": "https://loremflickr.com/400/300/smartphone,iphone/all?random=2",
  "Bileşenler": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScvM5dxEoCimRSQtM1yjV1iOAK_zKDcFVZ9tbCr7-GxHU-lrObydd8N8E&s=10",
  "Monitör": "https://storage.ghost.io/c/65/97/65975283-c1f5-4a9b-8ea0-65b4ab8af1c6/content/images/wordpress/2023/01/PLS-ekran-nedir-1.jpg",
  "Ses": "https://i.ytimg.com/vi/VcbGumcaFA8/maxresdefault.jpg",
  "Depolama": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqgy3_4ZcGF0wLW7QHjFFgCAHZdbIWqOJuC5UakkruinoFciy4VIBi7jc&s=10",
  "Aksesuar": "https://loremflickr.com/400/300/keyboard,mouse/all?random=7",
  "Kamera": "https://cdn.media.amplience.net/i/canon/canon-camera-connect-v3_hero_3e9270b6a43c411db096653d642fab2c",
  "Masaüstü Bilgisayar": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg3uGQWFrXMAxre0rlYz1m6q-CePIdkRLt-GdN2Q9wgrPGcCFJ5CY_bN33&s=10",
};

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
        {linkLabel} <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

/* ============================================================
   ÜRÜNSEKELETİ (loading fallback)
   ============================================================ */
function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-100" />
          <div className="p-3 flex flex-col gap-2">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-100" />
          <div className="p-3 flex flex-col gap-2">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   ÇOK SATANLAR (Server Component)
   ============================================================ */
async function BestSellersSection() {
  let products: ProductSummary[] = [];

  try {
    const resp = await getFeaturedProducts(8);
    products = resp.content;
  } catch {
    products = PLACEHOLDER_SUMMARY_PRODUCTS.filter(p => p.isFeatured).slice(0, 8);
  }

  if (!products.length) return null;

  return (
    <section className="mb-6 bg-white border border-gray-200 rounded-lg p-5">
      <SectionHeader
        title="Çok Satanlar"
        subtitle="Bu hafta en çok tercih edilen ürünler"
        href="/products"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 4} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   KATEGORİ BÖLÜMÜ (Server Component)
   ============================================================ */
async function CategorySection({
  category,
  title,
  emoji,
  count = 6,
}: {
  category: string;
  title: string;
  emoji: string;
  count?: number;
}) {
  let products: ProductSummary[] = [];

  try {
    const resp = await getProducts({
      page: 0,
      size: count,
      sort: "createdAt,desc",
    } as any);
    // Kategori filtresi için filter endpoint kullan, burada basit listeleme
    products = resp.content.filter(p => p.category === category).slice(0, count);
    // Yeterli yoksa tümünden çek
    if (products.length < count) {
      const all = await getProducts({ page: 0, size: 50 } as any);
      products = all.content.filter(p => p.category === category).slice(0, count);
    }
  } catch {
    products = PLACEHOLDER_SUMMARY_PRODUCTS
      .filter(p => p.category === category)
      .slice(0, count);
  }

  if (!products.length) return null;

  return (
    <section className="mb-6 bg-white border border-gray-200 rounded-lg p-5">
      <SectionHeader
        title={`${emoji} ${title}`}
        href={`/products?category=${encodeURIComponent(category)}`}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {products.map(p => (
          <ProductCard key={p.id} product={p} priority={false} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   İNDİRİMLİ ÜRÜNLER (Server Component)
   ============================================================ */
async function DiscountedSection() {
  let products: ProductSummary[] = [];

  try {
    const resp = await getProducts({ page: 0, size: 50 } as any);
    products = resp.content
      .filter(p => p.discountedPrice != null)
      .slice(0, 8);
  } catch {
    products = PLACEHOLDER_SUMMARY_PRODUCTS
      .filter(p => p.discountedPrice != null)
      .slice(0, 8);
  }

  if (!products.length) return null;

  return (
    <section className="mb-6 bg-white border border-gray-200 rounded-lg p-5">
      <SectionHeader
        title="🏷️ İndirimli Ürünler"
        subtitle="Fiyatlar düştü, kaçırmayın!"
        href="/products?onlyDiscount=1"
        linkLabel="Tüm İndirimler"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map(p => (
          <ProductCard key={p.id} product={p} priority={false} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   MARKA BANDI (Server Component — kategorilerden türetilir)
   ============================================================ */
async function BrandsStrip() {
  // Statik marka listesi — backend'e bağlanmadan güvenli render
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

  return (
    <section className="mb-6 bg-white border border-gray-200 rounded-lg p-5">
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
            <span className="text-xs font-extrabold tracking-tight" style={{ color: brand.color }}>
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   KATEGORİ HIZLI ERİŞİM GRİDİ (dinamik)
   ============================================================ */
async function CategoryQuickGrid() {
  let categories: CategoryInfo[] = [];

  try {
    categories = await getCategories();
  } catch {
    categories = [
      { name: "Laptop", productCount: 230 },
      { name: "Akıllı Telefon", productCount: 185 },
      { name: "Ekran Kartı", productCount: 78 },
      { name: "Monitör", productCount: 72 },
      { name: "Kulaklık", productCount: 84 },
      { name: "SSD & Depolama", productCount: 88 },
      { name: "Klavye & Mouse", productCount: 65 },
      { name: "Tablet", productCount: 47 },
    ];
  }

  const topCats = categories.slice(0, 8);

  return (
    <section className="mb-8">
      <SectionHeader
        title="Kategorilere Göz At"
        href="/products"
        linkLabel="Tüm Kategoriler"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {topCats.map(cat => {
          const fallbackImage = `https://loremflickr.com/400/300/gadget,tech/all?random=${cat.productCount}`;
          const imageUrl = CATEGORY_IMAGES[cat.name] || fallbackImage;

          return (
            <Link
              key={cat.name}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="relative group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/3] w-full relative overflow-hidden bg-gray-100">
                <Image
                  src={imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300" />
              </div>

              <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5 group-hover:text-blue-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs font-medium text-gray-300">
                  {cat.productCount.toLocaleString("tr-TR")} Ürün Seçeneği
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   ANA SAYFA
   ============================================================ */
export default function HomePage() {
  return (
    <div className="max-w-[1340px] mx-auto px-4 pb-10">

      {/* 1. BANNER SLIDER */}
      <section className="mt-4 mb-6">
        <Suspense fallback={<div className="w-full h-[420px] bg-gray-900 rounded-xl animate-pulse" />}>
          <BannerSlider />
        </Suspense>
      </section>

      {/* 2. GÜVEN ÇUBUĞU */}
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

      {/* 3. ÇOK SATANLAR */}
      <Suspense fallback={
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-5">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
          <ProductGridSkeleton count={8} />
        </div>
      }>
        <BestSellersSection />
      </Suspense>

      {/* 4. KATEGORİ HIZLI GRİD */}
      <Suspense fallback={
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-5 h-40 animate-pulse" />
      }>
        <CategoryQuickGrid />
      </Suspense>

      {/* 5. MARKA BANDI */}
      <BrandsStrip />

      {/* 6. LAPTOP BÖLÜMÜ */}
      <Suspense fallback={
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-5">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
          <ProductRowSkeleton count={6} />
        </div>
      }>
        <CategorySection category="Laptop" title="Laptop Fırsatları" emoji="💻" count={6} />
      </Suspense>

      {/* 7. TELEFON BÖLÜMÜ */}
      <Suspense fallback={
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-5">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
          <ProductRowSkeleton count={6} />
        </div>
      }>
        <CategorySection category="Akıllı Telefon" title="Telefon Kampanyaları" emoji="📱" count={6} />
      </Suspense>

      {/* 8. İNDİRİMLİ ÜRÜNLER */}
      <Suspense fallback={
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-5">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
          <ProductGridSkeleton count={8} />
        </div>
      }>
        <DiscountedSection />
      </Suspense>

      {/* 9. ALT KAMPANYA BANDI */}
      <section className="rounded-lg overflow-hidden bg-gradient-to-r from-blue-700 to-blue-900 p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              1.030 Ürün — Hepsi Burada
            </h2>
            <p className="text-blue-200 text-sm mt-1">
              Ürünleri keşfedin. Ücretsiz kargo, kolay iade.
            </p>
          </div>
          <Link
            href="/products"
            id="homepage-all-products-btn"
            className="flex-shrink-0 px-8 py-3 bg-white text-blue-800 font-extrabold text-base rounded hover:bg-gray-100 transition-colors shadow-lg"
          >
            Alışverişe Başla →
          </Link>
        </div>
      </section>

    </div>
  );
}
