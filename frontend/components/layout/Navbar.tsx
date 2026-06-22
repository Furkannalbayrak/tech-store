"use client";

/**
 * components/layout/Navbar.tsx
 * -----------------------------
 * Ana navigasyon çubuğu — premium dark tech-store tasarımı.
 *
 * ÖZELLİKLER:
 *  - Scroll'da arka plan bulanıklaştırma (backdrop-blur) efekti
 *  - Tam ekran mobil menü (hamburger toggle)
 *  - Arama çubuğu (SearchBar) ile entegrasyon
 *  - Clerk'in UserButton / SignInButton duruma göre gösterilir
 *  - Sepet ikonu (ilerideki adımda Redux/Zustand ile bağlanacak)
 *
 * "use client" — Clerk hook'ları (useAuth, useUser) ve scroll listener
 * React state gerektirdiğinden bu bileşen Client Component'tır.
 */

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import {
  ShoppingCart,
  Search,
  Cpu,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// NAVİGASYON LİNK'LERİ
// ---------------------------------------------------------------------------
const NAV_LINKS = [
  { href: "/products", label: "Tüm Ürünler" },
  { href: "/products?category=Laptop", label: "Laptop" },
  { href: "/products?category=Smartphone", label: "Telefon" },
  { href: "/products?category=GPU", label: "Ekran Kartı" },
  { href: "/products?category=Monitor", label: "Monitör" },
];

// ---------------------------------------------------------------------------
// ANA BİLEŞEN
// ---------------------------------------------------------------------------
export default function Navbar() {
  /** Clerk: kullanıcı oturum durumu */
  const { isSignedIn } = useAuth();
  /** Scroll pozisyonuna göre arka plan değişimi */
  const [isScrolled, setIsScrolled] = useState(false);
  /** Mobil menü açık/kapalı durumu */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  /** Arama çubuğu açık/kapalı durumu */
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  /** Arama input değeri */
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * Scroll dinleyicisi: 20px'den fazla kaydırıldığında
   * navbar arka planı blur + koyu efekti alır.
   */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** Mobil menü açıkken body scroll'u engelle */
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  /** Arama formunu gönder */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Bir sonraki adımda router.push ile arama sayfasına yönlendirilecek
    window.location.href = `/products?keyword=${encodeURIComponent(searchQuery.trim())}`;
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      {/* ================================================================
          ANA NAVBAR
          ================================================================ */}
      <header
        className={cn(
          // Pozisyon ve z-index: sayfanın en üstünde sabit durur
          "fixed top-0 left-0 right-0 z-50",
          // Geçiş animasyonu
          "transition-all duration-300 ease-in-out",
          // Scroll'a göre arka plan değişimi
          isScrolled
            ? "bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60 shadow-2xl shadow-black/20"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* ---- LOGO ---- */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group flex-shrink-0"
            >
              {/* Logo ikonu — elektrik efektli */}
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-105">
                <Cpu className="w-5 h-5 text-white" strokeWidth={1.8} />
                <Zap
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 text-yellow-400 fill-yellow-400"
                  strokeWidth={2}
                />
              </div>
              {/* Logo metni */}
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight text-white">
                  Tech
                  <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                    Store
                  </span>
                </span>
                <span className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
                  Premium Tech
                </span>
              </div>
            </Link>

            {/* ---- MASAÜSTÜ NAVİGASYON ---- */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3.5 py-2 text-sm font-medium text-zinc-400 rounded-lg
                             hover:text-white hover:bg-white/5
                             transition-all duration-200
                             group"
                >
                  {link.label}
                  {/* Hover'da alt çizgi efekti */}
                  <span className="absolute bottom-1 left-3.5 right-3.5 h-px bg-gradient-to-r from-blue-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                </Link>
              ))}
            </nav>

            {/* ---- SAĞ EYLEMLER ---- */}
            <div className="flex items-center gap-2">

              {/* Arama butonu — masaüstü */}
              <button
                id="navbar-search-btn"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl
                           text-zinc-400 text-sm
                           bg-white/5 border border-zinc-800
                           hover:bg-white/10 hover:text-white hover:border-zinc-600
                           transition-all duration-200"
                aria-label="Ara"
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline text-xs text-zinc-500">Ürün ara...</span>
              </button>

              {/* Sepet butonu */}
              <Link
                href="/cart"
                id="navbar-cart-btn"
                className="relative flex items-center justify-center w-9 h-9 rounded-xl
                           text-zinc-400
                           hover:text-white hover:bg-white/10
                           transition-all duration-200"
                aria-label="Sepete git"
              >
                <ShoppingCart className="w-5 h-5" />
                {/* Sepet sayacı badge — ilerideki adımda dinamik yapılacak */}
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-[9px] font-bold text-white leading-none">
                  0
                </span>
              </Link>

              {/* Clerk kimlik doğrulama butonları */}
              <div className="flex items-center">
                {isSignedIn ? (
                  /* Giriş yapılmış → Clerk profil butonu */
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9 ring-2 ring-blue-500/40 hover:ring-blue-500/80 transition-all duration-200",
                      },
                    }}
                  />
                ) : (
                  /* Giriş yapılmamış → Sign In butonu */
                  <SignInButton mode="modal">
                    <button
                      id="navbar-signin-btn"
                      className="px-4 py-2 text-sm font-semibold rounded-xl
                                 bg-gradient-to-r from-blue-500 to-violet-600
                                 hover:from-blue-400 hover:to-violet-500
                                 text-white shadow-lg shadow-blue-500/25
                                 hover:shadow-blue-500/40 hover:scale-[1.02]
                                 transition-all duration-200"
                    >
                      Giriş Yap
                    </button>
                  </SignInButton>
                )}
              </div>

              {/* Mobil hamburger butonu */}
              <button
                id="navbar-mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl
                           text-zinc-400 hover:text-white hover:bg-white/10
                           transition-all duration-200"
                aria-label={isMobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* ---- MASAÜSTÜ ARAMA ÇUBUĞU (Açılır panel) ---- */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isSearchOpen ? "max-h-20 pb-3 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="navbar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün, marka veya kategori ara..."
                autoFocus={isSearchOpen}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm
                           bg-zinc-900 border border-zinc-700
                           text-white placeholder-zinc-500
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                           transition-all duration-200"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium rounded-lg
                           bg-blue-500 hover:bg-blue-400 text-white transition-colors"
              >
                Ara
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ================================================================
          MOBİL MENÜ (Tam ekran overlay)
          ================================================================ */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          "transition-all duration-300 ease-in-out",
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Karartma overlay */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menü paneli */}
        <div
          className={cn(
            "absolute top-16 left-0 right-0 bottom-0",
            "bg-zinc-950 border-t border-zinc-800",
            "flex flex-col overflow-y-auto",
            "transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-y-0" : "-translate-y-4"
          )}
        >
          {/* Mobil arama */}
          <div className="p-4 border-b border-zinc-800/60">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="mobile-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün ara..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                           bg-zinc-900 border border-zinc-800 text-white
                           placeholder-zinc-600
                           focus:outline-none focus:border-blue-500"
              />
            </form>
          </div>

          {/* Mobil nav linkleri */}
          <nav className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-4 py-3.5 rounded-xl text-sm font-medium
                           text-zinc-300 hover:text-white hover:bg-white/5
                           transition-all duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobil alt alan — Clerk butonları */}
          <div className="mt-auto p-4 border-t border-zinc-800/60">
            {isSignedIn ? (
              <div className="flex items-center gap-3 px-2">
                <UserButton />
                <span className="text-sm text-zinc-400">Hesabım</span>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button
                  id="mobile-signin-btn"
                  className="w-full py-3 text-sm font-semibold rounded-xl
                             bg-gradient-to-r from-blue-500 to-violet-600
                             text-white text-center"
                >
                  Giriş Yap
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>

      {/* Navbar yüksekliği kadar boşluk — içerik arkaya gizlenmesin */}
      <div className="h-16 lg:h-18" aria-hidden="true" />
    </>
  );
}
