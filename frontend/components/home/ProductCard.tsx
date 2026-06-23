"use client";

/**
 * components/home/ProductCard.tsx
 * ----------------------------------------
 * Amazon / Vatan Bilgisayar tarzı sade, beyaz ürün kartı.
 *
 * TASARIM KURALLARI:
 *  - Beyaz arka plan, ince gri sınır (1px)
 *  - Hover: hafif mavi sınır + gölge
 *  - Görsel: temiz, beyaz bg, ortalanmış
 *  - Fiyat: kırmızı (indirimli) veya siyah (normal)
 *  - Üstü çizili eski fiyat + indirim yüzdesi rozeti
 *  - Yıldız değerlendirmesi (amber)
 *  - Belirgin, tam genişlik "Sepete Ekle" butonu (mavi)
 */

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, Package, Truck, Zap } from "lucide-react";
import type { ProductSummary } from "@/lib/types/api.types";
import { getProductMeta } from "@/lib/data/placeholder-products";

interface ProductCardProps {
  product: ProductSummary;
  priority?: boolean;
}

/* ============================================================
   YARDIMCILAR
   ============================================================ */
const fmt = (n: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
  }).format(n);

const calcPct = (orig: number, disc: number) =>
  Math.round(((orig - disc) / orig) * 100);

/* ============================================================
   YILDIZ PUANI (Mini bileşen)
   ============================================================ */
function StarRow({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {/* Yıldızlar */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < Math.floor(rating)
                ? "fill-amber-400 text-amber-400"
                : i === Math.floor(rating) && rating % 1 >= 0.5
                ? "fill-amber-200 text-amber-200"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-[11px] text-gray-500">({count.toLocaleString("tr-TR")})</span>
    </div>
  );
}

/* ============================================================
   ANA BİLEŞEN
   ============================================================ */
export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const hasDiscount  = product.discountedPrice != null;
  const isOos        = product.stockQuantity === 0;
  const isLowStock   = product.stockQuantity > 0 && product.stockQuantity <= 5;
  const discountPct  = hasDiscount ? calcPct(product.price, product.discountedPrice!) : 0;
  const displayPrice = hasDiscount ? product.discountedPrice! : product.price;
  const meta         = getProductMeta(product.id);

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Adım 8 — Zustand cart store
    console.log("Sepete eklendi:", product.id);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      id={`product-card-${product.id}`}
      className="group flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden
                 hover:border-blue-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      {/* ============================================================
          GÖRSEL ALANI
          ============================================================ */}
      <div className="relative bg-white flex items-center justify-center overflow-hidden"
           style={{ aspectRatio: "1 / 1", padding: "12px" }}>

        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
            priority={priority}
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-gray-300">
            <Package className="w-12 h-12" strokeWidth={1} />
            <span className="text-xs">{product.category}</span>
          </div>
        )}

        {/* İndirim rozeti */}
        {hasDiscount && discountPct > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">
            -%{discountPct}
          </div>
        )}

        {/* Stok tükendi overlay */}
        {isOos && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-500 border border-gray-300 px-3 py-1 rounded bg-white">
              Stok Tükendi
            </span>
          </div>
        )}
      </div>

      {/* ============================================================
          BİLGİ ALANI
          ============================================================ */}
      <div className="flex flex-col flex-1 p-3 border-t border-gray-100 gap-1.5">

        {/* Marka */}
        {product.brand && (
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">
            {product.brand}
          </span>
        )}

        {/* Ürün adı */}
        <h3 className="text-[13px] text-gray-800 font-medium leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors min-h-[36px]">
          {product.name}
        </h3>

        {/* Yıldız puanı */}
        <StarRow rating={meta.rating} count={meta.reviewCount} />

        {/* Kargo / teslimat rozeti */}
        <div className="flex items-center gap-2">
          {meta.hasFreeShipping && (
            <span className="inline-flex items-center gap-1 text-[11px] text-green-700 font-medium">
              <Truck className="w-3 h-3" /> Ücretsiz Kargo
            </span>
          )}
          {meta.hasFastDelivery && (
            <span className="inline-flex items-center gap-1 text-[11px] text-orange-600 font-medium">
              <Zap className="w-3 h-3" /> {meta.deliveryDays}
            </span>
          )}
        </div>

        {/* Stok uyarısı */}
        {isLowStock && (
          <span className="text-[11px] font-semibold text-red-600">
            🔥 Son {product.stockQuantity} adet!
          </span>
        )}

        {/* FİYAT ALANI */}
        <div className="mt-auto pt-1 flex flex-col gap-0.5">
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">{fmt(product.price)}</span>
          )}
          <span className={`text-lg font-bold ${hasDiscount ? "text-red-600" : "text-gray-900"}`}>
            {fmt(displayPrice)}
          </span>
        </div>

        {/* SEPETE EKLE BUTONU — tam genişlik, mavi, her zaman görünür */}
        <button
          id={`add-to-cart-${product.id}`}
          onClick={handleCart}
          disabled={isOos}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded
                     text-sm font-semibold border transition-all duration-150
                     bg-blue-700 hover:bg-blue-800 border-blue-700 text-white
                     disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
                     active:scale-[0.98]"
        >
          <ShoppingCart className="w-4 h-4" />
          {isOos ? "Stok Yok" : "Sepete Ekle"}
        </button>
      </div>
    </Link>
  );
}
