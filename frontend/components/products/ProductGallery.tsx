"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  hasDiscount: boolean;
  discountPct: number;
}

export default function ProductGallery({ images, productName, hasDiscount, discountPct }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const mainImage = images[currentIndex] || images[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Ana görsel */}
      <div className="relative w-full aspect-square rounded-2xl bg-white border border-gray-200 flex items-center justify-center group">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={productName}
            fill
            priority
            sizes="(max-width:1024px) 100vw, 55vw"
            className="object-contain p-8 transition-all duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-6xl">📦</div>
        )}
        
        {/* İndirim rozeti */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-sm font-extrabold text-white bg-red-600 shadow-lg z-10">
            -%{discountPct} İNDİRİM
          </div>
        )}

        {/* Oklar (Sadece birden fazla görsel varsa) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 hover:text-blue-600 z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 hover:text-blue-600 z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Küçük görseller */}
      {images.length > 1 && (
        <div className="flex flex-wrap items-center gap-3">
          {images.map((url, i) => (
            <div
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white border cursor-pointer transition-all ${
                currentIndex === i 
                  ? "border-blue-600 ring-1 ring-blue-600 opacity-100" 
                  : "border-gray-200 hover:border-blue-400 opacity-70 hover:opacity-100"
              }`}
            >
              {url && <Image src={url} alt={`${productName} ${i + 1}`} fill className="object-contain p-2" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
