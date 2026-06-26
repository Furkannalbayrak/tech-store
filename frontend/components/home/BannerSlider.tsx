"use client";

/**
 * components/home/BannerSlider.tsx
 * ---------------------------------
 * Premium e-ticaret banner slider.
 * Gerçek ürün görselleri, smooth animasyonlar, progress bar.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Tag, Zap, Shield, Truck } from "lucide-react";

/* ============================================================
   KAMPANYA VERİSİ
   ============================================================ */
const BANNERS = [
  {
    id: 1,
    badge: "MEGA İNDİRİM",
    badgeColor: "#EF4444",
    title: "En Yeni Laptop\nModelleri",
    highlight: "%30'a varan",
    subtitle: "MacBook, ASUS ROG, Lenovo ThinkPad ve daha fazlası — bu fiyatları kaçırmayın!",
    cta: "Laptoplara Git",
    href: "/products?category=Dizüstü%20Bilgisayar",
    tag: "500+ Model",
    tagIcon: "zap",
    bgGradient: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #1D4ED8 100%)",
    accentColor: "#3B82F6",
    imageUrl: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=85&auto=format&fit=crop",
    imageAlt: "Gaming Laptop",
    badge2: "ÜCRETSİZ KARGO",
  },
  {
    id: 2,
    badge: "YENİ SEZON",
    badgeColor: "#8B5CF6",
    title: "iPhone 16 & Samsung\nS25 Serisi",
    highlight: "En Güncel",
    subtitle: "Resmi distribütörden, faturalı, garantili — Türkiye'nin en uygun fiyatları burada.",
    cta: "Telefonlara Bak",
    href: "/products?category=Telefon",
    tag: "Hızlı Teslimat",
    tagIcon: "truck",
    bgGradient: "linear-gradient(135deg, #1A0533 0%, #3B1060 50%, #7C3AED 100%)",
    accentColor: "#A855F7",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=85&auto=format&fit=crop",
    imageAlt: "Akıllı Telefonlar",
    badge2: "RESMİ GARANTİ",
  },
  {
    id: 3,
    badge: "OYUNCU FIRSAT",
    badgeColor: "#10B981",
    title: "RTX 5090 &\nPC Bileşenleri",
    highlight: "Sınırlı Stok",
    subtitle: "NVIDIA RTX 5090, DDR5 RAM, PCIe Gen5 SSD — Türkiye'de sadece bizde bu fiyata!",
    cta: "Bileşenlere Bak",
    href: "/products?category=Bileşenler",
    tag: "Ücretsiz Montaj",
    tagIcon: "shield",
    bgGradient: "linear-gradient(135deg, #052E16 0%, #064E3B 50%, #047857 100%)",
    accentColor: "#10B981",
    imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=85&auto=format&fit=crop",
    imageAlt: "Gaming PC Bileşenleri",
    badge2: "STOK TÜKENİYOR",
  },
  {
    id: 4,
    badge: "KAMPANYA",
    badgeColor: "#F59E0B",
    title: "4K OLED Monitör\nFırsatları",
    highlight: "%25'e varan",
    subtitle: "LG, Samsung, ASUS ProArt — profesyonel çalışmadan oyuna kadar mükemmel görüntü.",
    cta: "Monitörlere Git",
    href: "/products?category=Monit%C3%B6r",
    tag: "30 Gün İade",
    tagIcon: "tag",
    bgGradient: "linear-gradient(135deg, #1C0A00 0%, #451A03 50%, #D97706 100%)",
    accentColor: "#F59E0B",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=85&auto=format&fit=crop",
    imageAlt: "Monitör",
    badge2: "KOLAY İADE",
  },
];

const AUTO_INTERVAL = 5000;

function TagIcon({ type, className }: { type: string; className?: string }) {
  const props = { className: className || "w-3.5 h-3.5" };
  if (type === "zap") return <Zap {...props} />;
  if (type === "truck") return <Truck {...props} />;
  if (type === "shield") return <Shield {...props} />;
  return <Tag {...props} />;
}

/* ============================================================
   ANA BİLEŞEN
   ============================================================ */
export default function BannerSlider() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const goTo = useCallback((index: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setActive(index);
      setProgress(0);
      startTimeRef.current = Date.now();
      setTransitioning(false);
    }, 300);
  }, [transitioning]);

  const next = useCallback(() => goTo((active + 1) % BANNERS.length), [active, goTo]);
  const prev = useCallback(() => goTo((active - 1 + BANNERS.length) % BANNERS.length), [active, goTo]);

  /* Progress bar */
  useEffect(() => {
    if (isPaused) return;
    startTimeRef.current = Date.now();
    setProgress(0);

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / AUTO_INTERVAL) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(progressRef.current!);
      }
    }, 50);

    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [active, isPaused]);

  /* Otomatik ilerleme */
  useEffect(() => {
    if (isPaused) return;
    const id = setTimeout(() => next(), AUTO_INTERVAL);
    return () => clearTimeout(id);
  }, [active, isPaused, next]);

  const banner = BANNERS[active];

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl select-none"
      style={{ height: "420px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {BANNERS.map((b, i) => (
        <div
          key={b.id}
          className="absolute inset-0 transition-opacity duration-500 ease-in-out"
          style={{
            opacity: i === active ? 1 : 0,
            pointerEvents: i === active ? "auto" : "none",
            background: b.bgGradient,
          }}
        >
          {/* Arka plan ürün görseli */}
          <div className="absolute inset-0">
            <Image
              src={b.imageUrl}
              alt={b.imageAlt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover object-center"
              style={{ opacity: 0.18 }}
            />
          </div>

          {/* Gradient overlay (sol koyu, sağ şeffaf) */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.05) 100%)",
            }}
          />

          {/* Sağ görsel — büyük, net */}
          <div className="absolute right-0 top-0 bottom-0 w-[52%] hidden md:block">
            <Image
              src={b.imageUrl}
              alt={b.imageAlt}
              fill
              priority={i === 0}
              sizes="52vw"
              className="object-cover object-center"
              style={{ maskImage: "linear-gradient(to right, transparent 0%, black 30%)" }}
            />
            {/* İnce parlak kenar efekti */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${b.bgGradient.match(/#[0-9A-F]{6}/i)?.[0] ?? '#000'} 0%, transparent 35%)`,
              }}
            />
          </div>

          {/* İÇERİK */}
          <div className="relative z-10 h-full max-w-[1340px] mx-auto px-8 lg:px-12 flex items-center">
            <div className="flex flex-col gap-4 max-w-[520px]">

              {/* Badge */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black tracking-widest text-white uppercase"
                  style={{ backgroundColor: b.badgeColor }}
                >
                  {b.badge}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-white uppercase border border-white/20 bg-white/10"
                >
                  <TagIcon type={b.tagIcon} className="w-3 h-3" />
                  {b.tag}
                </span>
              </div>

              {/* Başlık */}
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
              >
                <span
                  className="block text-sm font-bold tracking-wider uppercase mb-1"
                  style={{ color: b.accentColor }}
                >
                  {b.highlight} İndirim
                </span>
                {b.title.split("\n").map((line, idx) => (
                  <span key={idx} className="block">{line}</span>
                ))}
              </h2>

              {/* Alt yazı */}
              <p className="text-sm text-white/75 leading-relaxed max-w-sm">
                {b.subtitle}
              </p>

              {/* CTA butonu */}
              <div className="flex items-center gap-3 mt-1">
                <Link
                  href={b.href}
                  className="px-6 py-3 font-bold text-sm rounded-lg text-gray-900 shadow-lg transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: "white" }}
                >
                  {b.cta} →
                </Link>
              </div>

            </div>
          </div>
        </div>
      ))}

      {/* SOL/SAĞ OKLAR */}
      <button
        onClick={prev}
        aria-label="Önceki banner"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30
                   w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm
                   flex items-center justify-center text-white transition-all hover:scale-110 border border-white/10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        aria-label="Sonraki banner"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30
                   w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm
                   flex items-center justify-center text-white transition-all hover:scale-110 border border-white/10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* ALT PANEL: ortalanmış göstergeler */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pb-5">
        <div className="flex items-center justify-center gap-2">
          {BANNERS.map((b, i) => (
            <button
              key={b.id}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className="relative overflow-hidden rounded transition-all duration-300"
              style={{
                width: i === active ? "56px" : "28px",
                height: "4px",
                backgroundColor: i === active ? "white" : "rgba(255,255,255,0.3)",
              }}
            >
              {i === active && (
                <span
                  className="absolute left-0 top-0 h-full rounded transition-none"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: banner.accentColor,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Üst-sağ: rozet */}
      <div className="absolute top-5 right-5 z-30">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white uppercase tracking-wide"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          🔥 {banner.badge2}
        </span>
      </div>

    </div>
  );
}
