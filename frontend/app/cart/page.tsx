"use client";

/**
 * app/cart/page.tsx
 * ------------------
 * Premium sepet sayfası.
 * Zustand store'dan okur, localStorage'da kalıcı.
 */

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowLeft,
  Truck, ShieldCheck, RotateCcw, Tag, ChevronRight,
  PackageOpen,
} from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0 }).format(n);

/* ============================================================
   BOŞ SEPET
   ============================================================ */
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
        <PackageOpen className="w-12 h-12 text-gray-300" strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Sepetiniz boş</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          Henüz sepetinize ürün eklemediniz. Hemen alışverişe başlayın!
        </p>
      </div>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white font-bold text-sm rounded-xl hover:bg-blue-800 transition-colors shadow-lg"
      >
        <ShoppingCart className="w-4 h-4" />
        Alışverişe Başla
      </Link>
    </div>
  );
}

/* ============================================================
   GÜVEN ÇUBUĞU
   ============================================================ */
const TRUST = [
  { Icon: Truck, label: "Ücretsiz Kargo", sub: "300₺ üzeri" },
  { Icon: ShieldCheck, label: "Güvenli Ödeme", sub: "256-bit SSL" },
  { Icon: RotateCcw, label: "30 Gün İade", sub: "Koşulsuz" },
];

/* ============================================================
   ANA SAYFA
   ============================================================ */
export default function CartPage() {
  const { items, removeItem, updateQty, clearCart } = useCartStore();
  const totalCount = useCartStore(s => s.totalCount());
  const totalPrice = useCartStore(s => s.totalPrice());
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const shippingFree = totalPrice >= 300;
  const shippingCost = shippingFree ? 0 : 49;
  const grandTotal = totalPrice + shippingCost;

  // Hydration hatasını önlemek için client tarafında mount olana kadar render etme
  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-[1340px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" /> Sepetim
        </h1>
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="max-w-[1340px] mx-auto px-4 py-8">

      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Sepetim
            <span className="ml-2 text-base font-semibold text-gray-400">
              ({totalCount} ürün)
            </span>
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Sepeti Temizle
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* SOL: Ürün Listesi */}
        <div className="flex-1 flex flex-col gap-3">

          {/* Güven çubuğu */}
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-around gap-4">
            {TRUST.map(({ Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-blue-700 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-semibold text-gray-700">{label}</p>
                  <p className="text-[11px] text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Ürünler */}
          {items.map((item) => {
            const hasDiscount = item.price < item.originalPrice;
            const discountPct = hasDiscount
              ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
              : 0;

            return (
              <div
                key={item.productId}
                className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow group"
              >
                {/* Görsel */}
                <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={112}
                        height={112}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingCart className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Bilgi */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    {/* Kategori + marka */}
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                      {item.brand} · {item.category}
                    </p>
                    {/* İsim */}
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-semibold text-gray-800 hover:text-blue-700 transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                  </div>

                  {/* Alt: Fiyat + Adet + Sil */}
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">

                    {/* Fiyat */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-extrabold text-gray-900">
                        {fmt(item.price)}
                      </span>
                      {hasDiscount && (
                        <>
                          <span className="text-sm text-gray-400 line-through">{fmt(item.originalPrice)}</span>
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                            -{discountPct}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Adet + Sil */}
                    <div className="flex items-center gap-3">
                      {/* Adet kontrolü */}
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Sil */}
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Alışverişe devam et */}
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm text-blue-700 font-semibold hover:text-blue-900 transition-colors mt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Alışverişe Devam Et
          </Link>
        </div>

        {/* SAĞ: Özet Paneli */}
        <div className="w-full lg:w-[360px] flex-shrink-0 lg:sticky lg:top-[130px]">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

            {/* Başlık */}
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-base">Sipariş Özeti</h2>
            </div>

            <div className="px-5 py-4 flex flex-col gap-3">

              {/* Ara toplam */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Ara Toplam ({totalCount} ürün)</span>
                <span className="font-semibold text-gray-800">{fmt(totalPrice)}</span>
              </div>

              {/* Kargo */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Kargo</span>
                {shippingFree ? (
                  <span className="font-semibold text-green-600">Ücretsiz</span>
                ) : (
                  <span className="font-semibold text-gray-800">{fmt(shippingCost)}</span>
                )}
              </div>

              {/* Ücretsiz kargo uyarısı */}
              {!shippingFree && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-100">
                  <Truck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    <strong>{fmt(300 - totalPrice)}</strong> daha ekleyin, kargo bedava!
                  </p>
                </div>
              )}

              <div className="border-t border-dashed border-gray-200 pt-3">
                {/* Toplam */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Toplam</span>
                  <span className="text-xl font-extrabold text-blue-700">{fmt(grandTotal)}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 text-right">KDV dahil</p>
              </div>

              {/* Kupon kodu */}
              <div className="flex items-center gap-2 border border-dashed border-gray-200 rounded-lg px-3 py-2">
                <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="İndirim kodu girin"
                  className="flex-1 text-sm text-gray-600 placeholder-gray-400 bg-transparent outline-none"
                />
                <button className="text-xs font-bold text-blue-700 hover:text-blue-900 flex-shrink-0 transition-colors">
                  Uygula
                </button>
              </div>

              {/* Ödemeye Geç */}
              <button className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-base rounded-xl transition-colors shadow-lg hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2">
                Ödemeye Geç
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Güven */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                256-bit SSL ile güvenli ödeme
              </div>
            </div>
          </div>

          {/* Kabul edilen kartlar */}
          <div className="mt-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 font-medium mb-2">Kabul Edilen Ödeme Yöntemleri</p>
            <div className="flex items-center gap-2 flex-wrap">
              {["Visa", "Mastercard", "Amex", "Troy", "Kapıda Ödeme"].map(m => (
                <span
                  key={m}
                  className="text-[10px] font-semibold px-2 py-1 bg-gray-100 rounded text-gray-500"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
