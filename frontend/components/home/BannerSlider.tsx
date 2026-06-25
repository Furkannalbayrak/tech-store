"use client";

/**
 * components/home/BannerSlider.tsx
 * ---------------------------------
 * Ana sayfa kampanya slider'ı.
 * Her 4 saniyede bir otomatik ilerler; ok tuşları ve nokta göstergeleri ile
 * manuel geçiş yapılabilir.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ============================================================
   KAMPANYA VERİSİ (statik — backend'e bağlandığında dinamik olacak)
   ============================================================ */
const BANNERS = [
  {
    id: 1,
    badge:    "MEGA FIRSAT",
    title:    "Laptop Kampanyası",
    subtitle: "Seçili laptop modellerinde %30'a varan indirim fırsatları!",
    cta:      "Laptoplara Git",
    href:     "/products?category=Laptop&onlyDiscount=1",
    bgFrom:   "#1E40AF",  /* blue-800 */
    bgTo:     "#1D4ED8",  /* blue-700 */
    emoji:    "💻",
    tag:      "500+ Model",
  },
  {
    id: 2,
    badge:    "YENİ SEZON",
    title:    "Akıllı Telefon Fırsatları",
    subtitle: "iPhone 16, Samsung S25 Ultra ve daha fazlası — en uygun fiyatlarla!",
    cta:      "Telefonları İncele",
    href:     "/products?category=Ak%C4%B1ll%C4%B1+Telefon",
    bgFrom:   "#7C3AED",  /* violet-700 */
    bgTo:     "#6D28D9",  /* violet-800 */
    emoji:    "📱",
    tag:      "Hızlı Teslimat",
  },
  {
    id: 3,
    badge:    "STOKlar SINIRSIZ",
    title:    "PC Bileşenleri",
    subtitle: "RTX 5090, DDR5 RAM, PCIe Gen5 SSD — performansın zirvesi burada.",
    cta:      "Bileşenlere Bak",
    href:     "/products?category=Ekran+Kart%C4%B1",
    bgFrom:   "#065F46",  /* emerald-800 */
    bgTo:     "#047857",  /* emerald-700 */
    emoji:    "🎮",
    tag:      "Ücretsiz Kargo",
  },
  {
    id: 4,
    badge:    "KAMPANYA",
    title:    "Monitör & Ses Sistemleri",
    subtitle: "4K OLED monitörler, premium kulaklıklar — %25'e varan indirim.",
    cta:      "Monitörlere Git",
    href:     "/products?category=Monit%C3%B6r",
    bgFrom:   "#B45309",  /* amber-700 */
    bgTo:     "#D97706",  /* amber-600 */
    emoji:    "🖥️",
    tag:      "Kolay İade",
  },
];

/* ============================================================
   ANA BİLEŞEN
   ============================================================ */
export default function BannerSlider() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => setActive(a => (a + 1) % BANNERS.length), []);
  const prev = useCallback(() => setActive(a => (a - 1 + BANNERS.length) % BANNERS.length), []);

  /* Otomatik ilerleme */
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next, isPaused]);

  const banner = BANNERS[active];

  return (
    <div
      className="relative w-full overflow-hidden rounded-none lg:rounded-lg select-none"
      style={{ height: "280px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Arka plan gradient */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-in-out"
        style={{ background: `linear-gradient(135deg, ${banner.bgFrom} 0%, ${banner.bgTo} 100%)` }}
      />

      {/* Hafif desen — ızgara */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* İÇERİK */}
      <div className="relative z-10 h-full max-w-[1340px] mx-auto px-8 flex items-center justify-between">

        {/* Sol: Metin */}
        <div className="flex flex-col gap-3 max-w-lg">
          <span className="inline-flex w-fit px-3 py-1 rounded text-xs font-bold tracking-widest bg-white/20 text-white uppercase">
            {banner.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            {banner.title}
          </h2>
          <p className="text-sm text-white/80 leading-relaxed max-w-md">
            {banner.subtitle}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <Link
              href={banner.href}
              className="px-5 py-2.5 bg-white text-gray-900 font-bold text-sm rounded hover:bg-gray-100 transition-colors shadow-lg"
            >
              {banner.cta} →
            </Link>
            <span className="text-xs text-white/70 font-medium">
              ✓ {banner.tag}
            </span>
          </div>
        </div>

        {/* Sağ: Emoji dekor */}
        <div className="hidden sm:flex items-center justify-center w-48 h-48 text-8xl select-none">
          {banner.emoji}
        </div>
      </div>

      {/* SOL/SAĞ OKLAR */}
      <button
        onClick={prev}
        aria-label="Önceki banner"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20
                   w-9 h-9 rounded-full bg-black/20 hover:bg-black/40
                   flex items-center justify-center text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        aria-label="Sonraki banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20
                   w-9 h-9 rounded-full bg-black/20 hover:bg-black/40
                   flex items-center justify-center text-white transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* ALT NOKTA GÖSTERGELERİ */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Banner ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === active
                ? "bg-white w-6 h-2"
                : "bg-white/40 hover:bg-white/60 w-2 h-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
