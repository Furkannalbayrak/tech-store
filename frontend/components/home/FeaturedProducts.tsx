/**
 * components/home/FeaturedProducts.tsx
 * ---------------------------------------
 * Öne çıkan ürünleri backend'den çeken Server Component.
 *
 * NEDEN SERVER COMPONENT?
 *  1. Veri çekme işlemi doğrudan sunucuda gerçekleşir; tarayıcıya
 *     boş HTML + JS paketi gitmez. İlk sayfa yüklemesi daha hızlıdır.
 *  2. Backend URL'si tarayıcıya sızmaz (güvenlik).
 *  3. Next.js, fetch sonuçlarını ISR (Incremental Static Regeneration)
 *     ile önbelleğe alabilir; böylece backend yük azalır.
 *  4. SEO: İçerik sunucu tarafında HTML'e gömülür, crawlers görür.
 *
 * HATA YÖNETİMİ:
 *  Backend çevrimdışı olduğunda uygulama çökmez; boş state ile
 *  kullanıcıya açıklayıcı bir mesaj gösterilir.
 *
 * SUSPENSE ENTEGRASYONU:
 *  Bu bileşen page.tsx içinde <Suspense> ile sarılmıştır.
 *  Veri gelene kadar FeaturedProductsSkeleton gösterilir.
 */

import Link from "next/link";
import { ArrowRight, AlertCircle } from "lucide-react";
import ProductCard from "./ProductCard";
import { getFeaturedProducts } from "@/lib/api/product.service";
import type { ProductSummary } from "@/lib/types/api.types";

// ---------------------------------------------------------------------------
// PLACEHOLDER VERİSİ — Backend bağlantısı yokken gösterilir
// ---------------------------------------------------------------------------
/**
 * Geliştirme ortamında backend henüz çalışmıyorsa veya veri yoksa
 * gerçekçi görünen placeholder ürünler göstererek UI testini mümkün kılar.
 * Prodüksiyon'da backend her zaman çalışacağından bu veriler görünmez.
 */
const PLACEHOLDER_PRODUCTS: ProductSummary[] = [
  {
    id: "placeholder-1",
    name: "Apple MacBook Pro 16\" M4 Pro",
    slug: "apple-macbook-pro-16-m4-pro",
    shortDescription: "M4 Pro çip, 48GB birleşik bellek, 512GB SSD",
    price: 89999,
    discountedPrice: 74999,
    brand: "Apple",
    category: "Laptop",
    stockQuantity: 12,
    thumbnailUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "placeholder-2",
    name: "ASUS ROG Zephyrus G16",
    slug: "asus-rog-zephyrus-g16-rtx4090",
    shortDescription: "RTX 4090, Intel Core i9, 32GB RAM, 2TB SSD",
    price: 119999,
    discountedPrice: null,
    brand: "ASUS",
    category: "Laptop",
    stockQuantity: 5,
    thumbnailUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "placeholder-3",
    name: "Samsung Galaxy S25 Ultra",
    slug: "samsung-galaxy-s25-ultra",
    shortDescription: "Snapdragon 8 Elite, 200MP kamera, 12GB RAM",
    price: 59999,
    discountedPrice: 54999,
    brand: "Samsung",
    category: "Smartphone",
    stockQuantity: 28,
    thumbnailUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "placeholder-4",
    name: "NVIDIA GeForce RTX 5090",
    slug: "nvidia-geforce-rtx-5090-founders",
    shortDescription: "24GB GDDR7, DLSS 4, 450W TDP, PCIe 5.0",
    price: 94999,
    discountedPrice: null,
    brand: "NVIDIA",
    category: "GPU",
    stockQuantity: 3,
    thumbnailUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80",
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "placeholder-5",
    name: "LG UltraGear 27\" 4K OLED",
    slug: "lg-ultragear-27-4k-oled-240hz",
    shortDescription: "240Hz, 0.03ms yanıt süresi, G-Sync Compatible",
    price: 34999,
    discountedPrice: 29999,
    brand: "LG",
    category: "Monitor",
    stockQuantity: 9,
    thumbnailUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "placeholder-6",
    name: "Sony WH-1000XM6",
    slug: "sony-wh-1000xm6-wireless",
    shortDescription: "Aktif gürültü engelleme, 35 saat pil, Hi-Res Audio",
    price: 14999,
    discountedPrice: 12999,
    brand: "Sony",
    category: "Kulaklık",
    stockQuantity: 18,
    thumbnailUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "placeholder-7",
    name: "Keychron Q3 Max Mekanik Klavye",
    slug: "keychron-q3-max-mechanical-keyboard",
    shortDescription: "Gateron Jupiter Red, QMK/VIA, RGB, Alüminyum gövde",
    price: 7999,
    discountedPrice: null,
    brand: "Keychron",
    category: "Keyboard",
    stockQuantity: 22,
    thumbnailUrl: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&q=80",
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "placeholder-8",
    name: "Apple iPad Pro 13\" M4",
    slug: "apple-ipad-pro-13-m4-wifi",
    shortDescription: "Ultra Retina XDR OLED, M4 çip, 16GB RAM, Apple Pencil Pro",
    price: 64999,
    discountedPrice: 59999,
    brand: "Apple",
    category: "Tablet",
    stockQuantity: 0,
    thumbnailUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
];

// ---------------------------------------------------------------------------
// ANA BİLEŞEN (Server Component)
// ---------------------------------------------------------------------------
export default async function FeaturedProducts() {
  /**
   * Backend'den öne çıkan ürünleri çek.
   * try/catch ile hata yakalanır:
   *   - Backend çalışmıyorsa → placeholder verisi göster
   *   - Veri yoksa → placeholder verisi göster
   */
  let products: ProductSummary[] = [];
  let isUsingPlaceholder = false;

  try {
    const response = await getFeaturedProducts(8);
    products = response.content;

    /**
     * Backend çalışıyor ama hiç ürün işaretlenmemişse
     * veya liste boşsa placeholder göster.
     */
    if (products.length === 0) {
      products = PLACEHOLDER_PRODUCTS;
      isUsingPlaceholder = true;
    }
  } catch {
    /**
     * Backend bağlantısı kurulamazsa:
     * Uygulama çökmez, placeholder içerik gösterilir.
     * Geliştirme sürecinde UI testi yapılabilir.
     */
    products = PLACEHOLDER_PRODUCTS;
    isUsingPlaceholder = true;
  }

  return (
    <section className="py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Bölüm başlığı */}
        <div className="flex items-end justify-between mb-10">
          <div className="flex flex-col gap-2">
            {/* Üst etiket */}
            <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">
              En İyi Seçimler
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Öne Çıkan Ürünler
            </h2>
            <p className="text-zinc-500 text-sm max-w-md">
              Editörlerimiz tarafından özenle seçilmiş, en popüler ve
              yüksek puanlı teknoloji ürünleri.
            </p>
          </div>

          {/* Tümünü gör linki */}
          <Link
            href="/products?onlyFeatured=true"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium
                       text-zinc-400 hover:text-white
                       transition-colors duration-150 group flex-shrink-0"
          >
            Tümünü Gör
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" />
          </Link>
        </div>

        {/* Geliştirme modu uyarısı */}
        {isUsingPlaceholder && (
          <div className="flex items-center gap-3 mb-8 px-4 py-3 rounded-xl
                          bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-400/80">
              <span className="font-semibold">Geliştirme Modu:</span> Backend bağlantısı
              kurulamadı. Örnek veriler gösteriliyor. Spring Boot sunucusunu başlatın.
            </p>
          </div>
        )}

        {/* Ürün Grid'i */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              /**
               * İlk 4 kart LCP (Largest Contentful Paint) için öncelikli yüklenir.
               * Diğerleri lazy load ile yüklenir; bu Core Web Vitals skorunu iyileştirir.
               */
              priority={index < 4}
            />
          ))}
        </div>

        {/* Mobil "Tümünü Gör" butonu */}
        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            href="/products?onlyFeatured=true"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
                       border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white
                       transition-all duration-200"
          >
            Tüm Öne Çıkan Ürünleri Gör
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
