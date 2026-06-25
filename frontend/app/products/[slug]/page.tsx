/**
 * app/products/[slug]/page.tsx
 * ------------------------------
 * Satış dönüşümü odaklı ürün detay sayfası.
 *
 * SATIŞ PSİKOLOJİSİ ÖĞELERİ:
 *  ✓ İndirim rozetli büyük puntolu fiyat
 *  ✓ Aciliyet: "Son X adet kaldı" stok uyarısı
 *  ✓ Güven: "Yarın Kapında" teslimat tarihi
 *  ✓ Sosyal kanıt: Yıldız puanı + yorum sayısı
 *  ✓ İki büyük CTA: "Sepete Ekle" + "Hemen Satın Al"
 *  ✓ Güven rozetleri (Güvenli Ödeme, Kolay İade, Orijinal Ürün)
 *  ✓ Teknik özellikler tablosu
 *  ✓ "Benzer Ürünler" kaydırmalı grid
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Star, ShoppingCart, Zap, Truck, Shield, RefreshCcw,
  ChevronRight, Check, AlertCircle, ArrowLeft, Clock
} from "lucide-react";
import ProductCard from "@/components/home/ProductCard";
import {
  getPlaceholderDetail,
  PLACEHOLDER_SUMMARY_PRODUCTS,
  getProductMeta,
} from "@/lib/data/placeholder-products";
import { getProductBySlug } from "@/lib/api/product.service";
import type { ProductDetail } from "@/lib/types/api.types";
import ProductGallery from "@/components/products/ProductGallery";

// ---------------------------------------------------------------------------
// YARDIMCI: Fiyat formatlayıcı
// ---------------------------------------------------------------------------
const fmt = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0 }).format(n);

// ---------------------------------------------------------------------------
// METADATA (SSG uyumlu)
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = getPlaceholderDetail(slug);
  if (!detail) return { title: "Ürün Bulunamadı" };
  return {
    title: detail.name,
    description: detail.shortDescription ?? detail.description?.slice(0, 160),
  };
}

// ---------------------------------------------------------------------------
// YILDIZ GÖSTERGESİ
// ---------------------------------------------------------------------------
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.floor(rating)
            ? "fill-amber-400 text-amber-400"
            : i === Math.floor(rating) && rating % 1 >= 0.5
              ? "fill-amber-400/50 text-amber-400"
              : "text-zinc-700"
            }`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SEPETE EKLE / HEMEN AL — Client wrapper
// ---------------------------------------------------------------------------
function AddToCartButtons({ product }: { product: ProductDetail }) {
  "use client";
  const { stockQuantity } = product;
  const isOos = stockQuantity === 0;

  return (
    <div className="flex gap-3">
      <button
        disabled={isOos}
        className="flex-1 flex items-center justify-center gap-2.5
                   py-4 rounded-2xl text-base font-bold
                   bg-zinc-800 border border-zinc-700 text-white
                   hover:bg-zinc-700 hover:border-zinc-500
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all duration-200 active:scale-[0.98]"
      >
        <ShoppingCart className="w-5 h-5" />
        Sepete Ekle
      </button>
      <button
        disabled={isOos}
        className="flex-1 flex items-center justify-center gap-2.5
                   py-4 rounded-2xl text-base font-extrabold
                   bg-gradient-to-r from-blue-500 to-violet-600
                   hover:from-blue-400 hover:to-violet-500
                   text-white shadow-xl shadow-blue-500/30
                   hover:shadow-blue-500/50 hover:scale-[1.02]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all duration-200 active:scale-[0.98]"
      >
        <Zap className="w-5 h-5" />
        Hemen Satın Al
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ANA SAYFA BİLEŞENİ
// ---------------------------------------------------------------------------
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Önce backend'den dene, başarısız olursa placeholder kullan
  let product: ProductDetail | null = null;
  let isPlaceholder = false;

  try {
    product = await getProductBySlug(slug);
  } catch {
    product = getPlaceholderDetail(slug);
    isPlaceholder = true;
  }

  // Hiç bulunamazsa 404
  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 bg-gray-50 text-center">
        <PackageNotFound />
      </div>
    );
  }

  const meta = getProductMeta(product.id);
  const hasDiscount = product.discountedPrice != null;
  const displayPrice = hasDiscount ? product.discountedPrice! : product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountedPrice!) / product.price) * 100)
    : 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
  const isOos = product.stockQuantity === 0;

  // Benzer ürünler (aynı kategoriden, bu ürün hariç)
  const related = PLACEHOLDER_SUMMARY_PRODUCTS
    .filter(p => p.category === product!.category && p.id !== product!.id)
    .slice(0, 6);

  // Görsel kaynağı düzeltmesi (Virgülle ayrılmış string geliyorsa böl)
  let allImages: string[] = [];
  if (product.imageUrls && product.imageUrls.length > 0) {
    if (product.imageUrls.length === 1 && product.imageUrls[0].includes(',')) {
      allImages = product.imageUrls[0].split(',');
    } else {
      allImages = product.imageUrls;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ---- BREADCRUMB ---- */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link href="/" className="hover:text-blue-700 transition-colors">Ana Sayfa</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-blue-700 transition-colors">Ürünler</Link>
          {product.category && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-blue-700 transition-colors">
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Placeholder uyarısı (geliştirme modu) */}
        {isPlaceholder && (
          <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              <span className="font-semibold">Geliştirme Modu:</span> Örnek veri gösteriliyor.
            </p>
          </div>
        )}

        {/* ================================================================
            ANA ÜRÜN BÖLGESİ: Görsel Sol | Bilgi Sağ
            ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr] gap-10 lg:gap-16 mb-16">

          {/* ---- SOL: GÖRSEL GALERİSİ ---- */}
          <ProductGallery
            images={allImages}
            productName={product.name}
            hasDiscount={hasDiscount}
            discountPct={discountPct}
          />

          {/* ---- SAĞ: SATIŞ BİLGİ PANELI ---- */}
          <div className="flex flex-col gap-5">

            {/* Marka + Puan */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              {product.brand && (
                <Link href={`/products?brand=${product.brand}`} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider">
                  {product.brand}
                </Link>
              )}
              <div className="flex items-center gap-2">
                <Stars rating={meta.rating} />
                <span className="text-sm text-gray-500">
                  {meta.rating} ({meta.reviewCount.toLocaleString("tr-TR")} değerlendirme)
                </span>
              </div>
            </div>

            {/* Ürün adı */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Kısa açıklama */}
            {product.shortDescription && (
              <p className="text-[13px] text-gray-600 leading-relaxed">{product.shortDescription}</p>
            )}

            {/* ---- FİYAT BLOKU ---- */}
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-4xl font-extrabold text-blue-900">{fmt(displayPrice)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-gray-400 line-through">{fmt(product.price)}</span>
                    <span className="px-2.5 py-1 rounded-lg text-sm font-bold text-white bg-red-600">
                      ₺{(product.price - displayPrice).toLocaleString("tr-TR")} Tasarruf
                    </span>
                  </>
                )}
              </div>
              {hasDiscount && (
                <p className="text-xs text-emerald-600 mt-2 font-medium">
                  🏷️ Bu ürünü bugün alarak %{discountPct} indirimden yararlanıyorsunuz!
                </p>
              )}
            </div>

            {/* ---- TESLİMAT & STOK BİLGİSİ ---- */}
            <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">

              {/* Teslimat */}
              {!isOos && (
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-bold text-emerald-600">
                      {meta.deliveryDays} Kargoya Verilir
                    </span>
                    <p className="text-xs text-gray-500">Ücretsiz kargo • Kapıda ödeme seçeneği</p>
                  </div>
                </div>
              )}

              {/* Stok durumu */}
              {isOos ? (
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-red-600">Stok Tükendi</span>
                </div>
              ) : isLowStock ? (
                <div className="flex items-center gap-3 animate-pulse">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="text-sm font-bold text-amber-600">
                    🔥 Son {product.stockQuantity} ürün kaldı!
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-emerald-600">
                    Stokta Var ({product.stockQuantity} adet)
                  </span>
                </div>
              )}

              {/* Aciliyet mesajı */}
              {!isOos && isLowStock && (
                <div className="flex items-center gap-2 px-3 py-2 mt-1 rounded-xl bg-amber-50 border border-amber-200">
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-xs text-amber-700 font-medium">
                    Bu ürün 24 saatte 12 kez sepete eklendi. Kaçırmayın!
                  </span>
                </div>
              )}
            </div>

            {/* ---- CTA BUTONLARI ---- */}
            <div className="flex gap-3 mt-2">
              <button
                disabled={isOos}
                className="flex-1 flex items-center justify-center gap-2
                           py-3 rounded-xl text-sm font-bold
                           bg-white border-2 border-blue-600 text-blue-600
                           hover:bg-blue-50
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200 active:scale-[0.98]"
              >
                <ShoppingCart className="w-4 h-4" />
                Sepete Ekle
              </button>
              <button
                disabled={isOos}
                className="flex-1 flex items-center justify-center gap-2
                           py-3 rounded-xl text-sm font-extrabold
                           bg-gradient-to-r from-blue-600 to-indigo-600
                           hover:from-blue-700 hover:to-indigo-700
                           text-white shadow-lg shadow-blue-500/30
                           hover:shadow-blue-500/50 hover:scale-[1.02]
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200 active:scale-[0.98]"
              >
                <Zap className="w-4 h-4" />
                Hemen Satın Al
              </button>
            </div>

            {/* ---- GÜVEN ROZETLERİ ---- */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { Icon: Shield, text: "Güvenli Ödeme", sub: "SSL Şifreli" },
                { Icon: RefreshCcw, text: "Kolay İade", sub: "30 Gün İçinde" },
                { Icon: Check, text: "Orijinal Ürün", sub: "Resmi Yetkili" },
              ].map(({ Icon, text, sub }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px] font-semibold text-gray-700">{text}</span>
                  <span className="text-[10px] text-gray-500">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================================================================
            TEKNİK ÖZELLİKLER
            ================================================================ */}
        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Teknik Özellikler</h2>
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              {Object.entries(product.attributes).map(([key, val], i) => (
                <div
                  key={key}
                  className={`flex items-start gap-4 px-5 py-4 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <span className="text-sm font-semibold text-gray-600 w-40 flex-shrink-0">{key}</span>
                  <span className="text-sm text-gray-900">{String(val)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ürün açıklaması */}
        {product.description && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Ürün Açıklaması</h2>
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-700 leading-loose whitespace-pre-wrap">{product.description}</p>
            </div>
          </section>
        )}

        {/* ================================================================
            BENZER ÜRÜNLER
            ================================================================ */}
        {related.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Benzer Ürünler</h2>
              {product.category && (
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Tümünü Gör →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={false} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 404 YARDİMCI BİLEŞENİ
// ---------------------------------------------------------------------------
function PackageNotFound() {
  return (
    <>
      <span className="text-6xl text-gray-300">📦</span>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ürün Bulunamadı</h1>
        <p className="text-gray-500 mt-2">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
      </div>
      <Link
        href="/products"
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
                   bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md"
      >
        <ArrowLeft className="w-4 h-4" />
        Ürünlere Dön
      </Link>
    </>
  );
}
