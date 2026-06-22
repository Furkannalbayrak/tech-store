/**
 * components/layout/Footer.tsx
 * ----------------------------
 * Site alt bilgi alanı — Server Component (no "use client" gerekmiyor).
 *
 * TASARIM:
 *  - Koyu (zinc-950) arka plan, Navbar ile tutarlı
 *  - 4 sütunlu ızgara: Logo+açıklama, Kategoriler, Destek, Yasal
 *  - Alt şerit: Telif hakkı + sosyal medya ikonları
 *  - Gradient çizgi separator
 */

import Link from "next/link";
import { Cpu, Zap, Globe, MessageCircle, Camera } from "lucide-react";

// ---------------------------------------------------------------------------
// STATİK VERİ
// ---------------------------------------------------------------------------
const FOOTER_LINKS = {
  kategoriler: [
    { href: "/products?category=Laptop",     label: "Laptoplar" },
    { href: "/products?category=Smartphone", label: "Akıllı Telefonlar" },
    { href: "/products?category=GPU",        label: "Ekran Kartları" },
    { href: "/products?category=Monitor",    label: "Monitörler" },
    { href: "/products?category=Keyboard",   label: "Klavyeler" },
    { href: "/products?onlyFeatured=true",   label: "Öne Çıkanlar" },
  ],
  destek: [
    { href: "/help",           label: "Yardım Merkezi" },
    { href: "/shipping",       label: "Kargo & Teslimat" },
    { href: "/returns",        label: "İade & Değişim" },
    { href: "/warranty",       label: "Garanti Koşulları" },
    { href: "/contact",        label: "İletişim" },
  ],
  yasal: [
    { href: "/privacy",        label: "Gizlilik Politikası" },
    { href: "/terms",          label: "Kullanım Koşulları" },
    { href: "/cookies",        label: "Çerez Politikası" },
    { href: "/kvkk",           label: "KVKK Aydınlatma" },
  ],
};

const SOCIAL_LINKS = [
  { href: "https://github.com",    Icon: Globe,          label: "Web" },
  { href: "https://twitter.com",   Icon: MessageCircle,  label: "Sosyal Medya" },
  { href: "https://instagram.com", Icon: Camera,         label: "Fotoğraf" },
];

// ---------------------------------------------------------------------------
// ANA BİLEŞEN
// ---------------------------------------------------------------------------
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/60">

      {/* ================================================================
          ANA FOOTER İÇERİĞİ
          ================================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* ---- SÜTUN 1: MARKA & AÇIKLAMA ---- */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 group mb-4">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl
                              bg-gradient-to-br from-blue-500 to-violet-600
                              shadow-lg shadow-blue-500/20">
                <Cpu className="w-5 h-5 text-white" strokeWidth={1.8} />
                <Zap
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 text-yellow-400 fill-yellow-400"
                  strokeWidth={2}
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-white">
                  Tech<span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Store</span>
                </span>
                <span className="text-[10px] font-medium tracking-widest text-zinc-600 uppercase">Premium Tech</span>
              </div>
            </Link>

            {/* Açıklama */}
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Türkiye&apos;nin en kapsamlı teknoloji mağazası. En son laptop&apos;lardan
              profesyonel ekipmanlara kadar binlerce ürün, güvenle.
            </p>

            {/* Sosyal medya ikonları */}
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL_LINKS.map(({ href, Icon, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-xl
                             bg-zinc-900 border border-zinc-800 text-zinc-500
                             hover:text-white hover:border-zinc-600 hover:bg-zinc-800
                             transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ---- SÜTUN 2: KATEGORİLER ---- */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-4">
              Kategoriler
            </h3>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_LINKS.kategoriler.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- SÜTUN 3: DESTEK ---- */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-4">
              Müşteri Desteği
            </h3>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_LINKS.destek.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- SÜTUN 4: YASAL ---- */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-4">
              Yasal
            </h3>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_LINKS.yasal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Güven rozetleri */}
            <div className="mt-6 flex flex-wrap gap-2">
              {["SSL Güvenli", "256-bit Şifreleme"].map((badge) => (
                <span
                  key={badge}
                  className="px-2.5 py-1 text-[10px] font-medium rounded-full
                             bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                >
                  ✓ {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          ALT ŞERİT: Telif hakkı
          ================================================================ */}
      {/* Gradient separator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600 text-center sm:text-left">
            &copy; {currentYear} TechStore. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-zinc-700 text-center">
            Next.js · Spring Boot · Supabase · Clerk ile inşa edildi
          </p>
        </div>
      </div>
    </footer>
  );
}
