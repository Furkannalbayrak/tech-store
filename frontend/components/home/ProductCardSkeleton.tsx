/**
 * components/home/ProductCardSkeleton.tsx
 * ----------------------------------------
 * ProductCard'ın yüklenme animasyonu (skeleton/shimmer).
 *
 * Next.js Suspense entegrasyonu:
 *   <Suspense fallback={<FeaturedProductsSkeleton />}>
 *     <FeaturedProducts />
 *   </Suspense>
 *
 * Shimmer animasyonu Tailwind'in "animate-pulse" ile sağlanır.
 * Kart boyutları ve düzeni ProductCard ile birebir eşleştirilmiştir;
 * böylece veri yüklendiğinde "layout shift" (CLS) yaşanmaz.
 */

// ---------------------------------------------------------------------------
// TEKİL İSKELET KARTI
// ---------------------------------------------------------------------------
function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 animate-pulse">
      {/* Görsel alanı */}
      <div className="aspect-[4/3] bg-zinc-800" />

      {/* Bilgi alanı */}
      <div className="flex flex-col gap-3 p-4">
        {/* Marka */}
        <div className="h-2.5 w-16 bg-zinc-800 rounded-full" />
        {/* Ürün adı — iki satır */}
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-full bg-zinc-800 rounded-full" />
          <div className="h-3.5 w-3/4 bg-zinc-800 rounded-full" />
        </div>
        {/* Açıklama */}
        <div className="h-2.5 w-2/3 bg-zinc-800 rounded-full" />
        {/* Fiyat */}
        <div className="h-5 w-24 bg-zinc-800 rounded-full mt-1" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BÖLÜM İSKELETİ — 8 kart varsayılan
// ---------------------------------------------------------------------------
interface FeaturedProductsSkeletonProps {
  count?: number;
}

export default function FeaturedProductsSkeleton({ count = 8 }: FeaturedProductsSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
