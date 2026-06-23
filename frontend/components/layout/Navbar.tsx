"use client";

/**
 * components/layout/Navbar.tsx
 * ----------------------------------------
 * Amazon / Vatan Bilgisayar tarzı İKİ KATLI MEGA NAVBAR.
 *
 * KATMAN 1 (h-16): Logo | Kategori+Arama | Giriş Yap | Sepetim
 * KATMAN 2 (h-10): Yatay kategori navigasyon barı (gri arka plan)
 *
 * Tasarım kuralları:
 *  - Beyaz arka plan, gri sınırlar
 *  - Süslü efekt YOK (neon, glow, gradient yok)
 *  - Büyük, belirgin arama çubuğu
 *  - Sade ikonlar + etiket
 *  - Mobil: hamburger menü
 */

import Link from "next/link";
import { useState } from "react";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import {
  Search, ShoppingCart, User, Menu, X,
  ChevronDown, Cpu,
} from "lucide-react";
import { useRouter } from "next/navigation";



/* ============================================================
   ALT NAVİGASYON LİNK'LERİ
   ============================================================ */
const NAV_LINKS = [
  { label: "🔥 Fırsatlar",        href: "/products?onlyDiscount=1" },
  { label: "Laptop",              href: "/products?category=Laptop" },
  { label: "Masaüstü PC",         href: "/products?category=Masa%C3%BCst%C3%BC+PC" },
  { label: "Telefon",             href: "/products?category=Ak%C4%B1ll%C4%B1+Telefon" },
  { label: "Tablet",              href: "/products?category=Tablet" },
  { label: "Ekran Kartı",         href: "/products?category=Ekran+Kart%C4%B1" },
  { label: "Monitör",             href: "/products?category=Monit%C3%B6r" },
  { label: "Klavye & Mouse",      href: "/products?category=Klavye+%26+Mouse" },
  { label: "Kulaklık",            href: "/products?category=Kulakl%C4%B1k" },
  { label: "SSD & Depolama",      href: "/products?category=SSD+%26+Depolama" },
  { label: "Ağ Ürünleri",         href: "/products?category=A%C4%9F+%C3%9Cr%C3%BCnleri" },
  { label: "Aksesuarlar",         href: "/products?category=Aksesuarlar" },
  { label: "PC Toplama",          href: "/products?category=PC+Toplama" },
];

/* ============================================================
   ANA BİLEŞEN
   ============================================================ */
export default function Navbar() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery]     = useState("");
  const [isMobileOpen, setIsMobileOpen]   = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams();
    params.set("keyword", searchQuery.trim());
    router.push(`/products?${params.toString()}`);
    setSearchQuery("");
  };

  return (
    <>
      {/* ==============================================================
          NAVBAR WRAPPER — Sabit, tam genişlik, beyaz arka plan
          ============================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">

        {/* ============================================================
            KATMAN 1: Logo | Arama | Kullanıcı
            h-16 = 64px
            ============================================================ */}
        <div className="border-b border-gray-200">
          <div className="max-w-[1440px] mx-auto px-4 h-16 flex items-center gap-4">

            {/* ---- LOGO ---- */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-700">
                <Cpu className="w-4.5 h-4.5 text-white" strokeWidth={2} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-extrabold text-blue-700 tracking-tight">
                  Tech<span className="text-orange-500">Store</span>
                </span>
                <span className="text-[9px] font-semibold tracking-widest text-gray-400 uppercase">
                  Hipermarket
                </span>
              </div>
            </Link>

            {/* ---- BÜYÜK ARAMA ÇUBUĞU (flex-1) ---- */}
            <form
              onSubmit={handleSearch}
              className="flex-1 flex items-stretch h-10 rounded-md overflow-hidden border border-gray-300 hover:border-blue-500 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
            >


              {/* Metin girişi */}
              <input
                id="navbar-search"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Ürün, marka veya kategori ara..."
                className="flex-1 px-4 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none"
              />

              {/* Ara butonu */}
              <button
                type="submit"
                id="navbar-search-btn"
                className="px-5 bg-blue-700 hover:bg-blue-800 text-white transition-colors flex-shrink-0 flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-semibold">Ara</span>
              </button>
            </form>

            {/* ---- SAĞ EYLEMLER ---- */}
            <div className="flex items-center gap-1 flex-shrink-0">

              {/* Giriş Yap / Profil */}
              {isSignedIn ? (
                <div className="flex flex-col items-center gap-0.5 px-3">
                  <UserButton />
                  <span className="text-[10px] text-gray-500 hidden sm:block">Hesabım</span>
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button
                    id="navbar-signin-btn"
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                  >
                    <User className="w-5 h-5 text-gray-600 group-hover:text-blue-700" />
                    <span className="text-[11px] text-gray-600 group-hover:text-blue-700 font-medium hidden sm:block">
                      Giriş Yap
                    </span>
                  </button>
                </SignInButton>
              )}

              {/* Sepetim */}
              <Link
                href="/cart"
                id="navbar-cart-btn"
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-blue-700" />
                  {/* Sepet sayacı — ilerideki adımda Zustand'a bağlanacak */}
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-[9px] font-bold text-white">
                    0
                  </span>
                </div>
                <span className="text-[11px] text-gray-600 group-hover:text-blue-700 font-medium hidden sm:block">
                  Sepetim
                </span>
              </Link>

              {/* Mobil hamburger */}
              <button
                id="navbar-mobile-btn"
                onClick={() => setIsMobileOpen(o => !o)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={isMobileOpen ? "Menüyü kapat" : "Menüyü aç"}
              >
                {isMobileOpen
                  ? <X className="w-5 h-5 text-gray-700" />
                  : <Menu className="w-5 h-5 text-gray-700" />
                }
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================
            KATMAN 2: KATEGORİ NAVİGASYON BARI
            h-10 = 40px, açık gri arka plan
            ============================================================ */}
        <div className="bg-gray-100 border-b border-gray-200 hidden lg:block">
          <div className="max-w-[1440px] mx-auto px-4">
            <nav className="flex items-center gap-0 h-10 overflow-x-auto scroll-x-smooth">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex-shrink-0 px-4 h-full flex items-center text-[13px] font-medium text-gray-700
                             hover:bg-white hover:text-blue-700 border-b-2 border-transparent
                             hover:border-blue-700 transition-all duration-150 whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ==============================================================
          MOBİL MENÜ
          ============================================================== */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-lg max-h-[70vh] overflow-y-auto">
            <nav className="flex flex-col py-2">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="px-6 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-b border-gray-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
