"use client";

/**
 * components/products/AddToCartButtons.tsx
 * -----------------------------------------
 * Ürün detay sayfasındaki "Sepete Ekle" ve "Hemen Satın Al" butonları.
 * Zustand cart store ile entegre çalışır.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Check } from "lucide-react";
import { useCartStore } from "@/lib/context/CartContext";
import type { ProductDetail } from "@/lib/types/api.types";

interface Props {
  product: ProductDetail;
}

export default function AddToCartButtons({ product }: Props) {
  const { addItem, isInCart } = useCartStore();
  const router = useRouter();
  const [justAdded, setJustAdded] = useState(false);

  const isOos = product.stockQuantity === 0;
  const alreadyInCart = isInCart(product.id);

  const displayPrice = product.discountedPrice ?? product.price;

  const handleAddToCart = () => {
    // Görsel URL'sini düzelt (virgülle ayrılmışsa ilkini al)
    let finalImage = "";
    if (product.imageUrls && product.imageUrls.length > 0) {
      if (product.imageUrls.length === 1 && product.imageUrls[0].includes(',')) {
        finalImage = product.imageUrls[0].split(',')[0];
      } else {
        finalImage = product.imageUrls[0];
      }
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: displayPrice,
      originalPrice: product.price,
      imageUrl: finalImage,
      category: product.category ?? "",
      brand: product.brand ?? "",
    });

    // Başarı animasyonu
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  return (
    <div className="flex gap-3">
      {/* Sepete Ekle */}
      <button
        disabled={isOos}
        onClick={handleAddToCart}
        className={`flex-1 flex items-center justify-center gap-2.5
                   py-4 rounded-2xl text-base font-bold
                   transition-all duration-200 active:scale-[0.98]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   ${justAdded || alreadyInCart
                     ? "bg-green-600 border border-green-500 text-white"
                     : "bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 hover:border-zinc-500"
                   }`}
      >
        {justAdded ? (
          <>
            <Check className="w-5 h-5" />
            Sepete Eklendi!
          </>
        ) : alreadyInCart ? (
          <>
            <Check className="w-5 h-5" />
            Sepette Var
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Sepete Ekle
          </>
        )}
      </button>

      {/* Hemen Satın Al */}
      <button
        disabled={isOos}
        onClick={handleBuyNow}
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
