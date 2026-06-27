"use client";

/**
 * components/layout/NavbarClient.tsx
 * -----------------------------------------------
 * Navbar'ın etkileşimli istemci tarafı bileşeni.
 * NavbarServer'dan kategorileri alır ve mega menü UI'ını render eder.
 *
 * MEGA MENÜ DAVRANIŞI:
 *  - Bir grup adına hover/click yapılınca geniş dropdown açılır
 *  - Dropdown içinde o gruba ait tüm kategoriler listelenir
 *  - Gruba uymayan kategoriler düz link olarak görünür
 */

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import {
  Search, ShoppingCart, User, Menu, X,
  ChevronDown, Cpu, Sparkles, Loader2,
} from "lucide-react";
import type { CategoryInfo } from "@/lib/types/api.types";
import { findGroup, MEGA_GROUPS } from "./Navbar";
import { useCartStore } from "@/lib/context/CartContext";

/* ============================================================
   GROUPLANMIş KATEGORİ YAPISI
   ============================================================ */
interface GroupedCategories {
  groups: Record<string, CategoryInfo[]>;   // Mega menü grupları
  standalone: CategoryInfo[];               // Gruba girmeyen tekil linkler
}

function buildGroupedCategories(cats: CategoryInfo[]): GroupedCategories {
  const groups: Record<string, CategoryInfo[]> = {};
  const standalone: CategoryInfo[] = [];

  for (const cat of cats) {
    const group = findGroup(cat.name);
    if (group) {
      if (!groups[group]) groups[group] = [];
      groups[group].push(cat);
    } else {
      standalone.push(cat);
    }
  }

  return { groups, standalone };
}

/* ============================================================
   MEGA MENÜ DROPDOWN
   ============================================================ */
function MegaMenuDropdown({
  groupName,
  items,
  isOpen,
  onClose,
}: {
  groupName: string;
  items: CategoryInfo[];
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 z-50 min-w-[240px] bg-white border border-gray-200 shadow-xl rounded-b-lg">
      {/* Ok üçgen */}
      <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-t border-l border-gray-200 rotate-45" />

      <div className="py-2">
        {/* Grup başlığı kaldırıldı (kullanıcı isteği üzerine tekrara düşmemesi için) */}

        {/* Kategori linkleri */}
        <div className="py-1 max-h-72 overflow-y-auto">
          {/* Tümünü gör linki */}
          <Link
            href={`/products?group=${encodeURIComponent(groupName)}`}
            onClick={onClose}
            className="flex items-center justify-between px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <span>Tümünü Gör</span>
            <span className="text-xs text-blue-500">→</span>
          </Link>

          <div className="border-t border-gray-100 mt-1 pt-1">
            {items.map(cat => (
              <Link
                key={cat.name}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                onClick={onClose}
                className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-700 transition-colors"
              >
                <span>{cat.name}</span>
                <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {cat.productCount.toLocaleString("tr-TR")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ANA CLIENT BİLEŞENİ
   ============================================================ */
interface NavbarClientProps {
  categories: CategoryInfo[];
}

export default function NavbarClient({ categories }: NavbarClientProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const cartCount = useCartStore(s => s.totalCount());

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const navRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  /* Dışarı tıklayınca mega menüyü kapat */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const isOutsideNav = navRef.current && !navRef.current.contains(target);
      const isOutsideMobile = !mobileMenuRef.current || !mobileMenuRef.current.contains(target);

      if (isOutsideNav && isOutsideMobile) {
        setOpenGroup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { groups, standalone } = buildGroupedCategories(categories);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setIsAiLoading(true);
    try {
      // AI Route Handler'a gönder
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      const p = new URLSearchParams();

      if (res.ok) {
        const filters = await res.json();
        if (filters.category)    p.set("category",    filters.category);
        if (filters.keyword)     p.set("keyword",     filters.keyword);
        if (filters.brand)       p.set("brand",       filters.brand);
        if (filters.minPrice != null) p.set("minPrice", String(filters.minPrice));
        if (filters.maxPrice != null) p.set("maxPrice", String(filters.maxPrice));
        if (filters.onlyDiscount) p.set("onlyDiscount", "1");

        // Hiç filtre çıkmadıysa keyword olarak ara
        if (![...p.keys()].length) p.set("keyword", q);
      } else {
        // AI hata → keyword fallback
        p.set("keyword", q);
      }

      router.push(`/products?${p.toString()}`);
      setSearchQuery("");
    } catch {
      // Network hatası → keyword fallback
      const p = new URLSearchParams();
      p.set("keyword", q);
      router.push(`/products?${p.toString()}`);
      setSearchQuery("");
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleGroup = (g: string) => setOpenGroup(prev => prev === g ? null : g);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm" ref={navRef}>

        {/* ============================================================
            KATMAN 1: Logo | Arama | Kullanıcı
            ============================================================ */}
        <div className="border-b border-gray-200">
          <div className="max-w-[1340px] mx-auto px-4 h-16 flex items-center justify-between gap-4">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-700">
                <Cpu className="w-4 h-4 text-white" strokeWidth={2} />
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

            {/* BÜYÜK ARAMA ÇUBUĞU (Sadece masaüstü) */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 items-stretch h-10 rounded-md overflow-hidden
                         border border-gray-300 hover:border-blue-500
                         focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100
                         transition-all"
            >
              {/* AI ikonu */}
              <div className="flex items-center pl-3 pr-1 bg-white">
                {isAiLoading
                  ? <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                  : <Sparkles className="w-4 h-4 text-purple-400" />}
              </div>

              {/* Metin girişi */}
              <input
                id="navbar-search"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="AI ile ara: &quot;2000₺ altı oyun laptopı&quot;..."
                disabled={isAiLoading}
                className="flex-1 px-2 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none disabled:opacity-60"
              />

              {/* Ara butonu */}
              <button
                type="submit"
                id="navbar-search-btn"
                disabled={isAiLoading}
                className="px-5 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white transition-colors flex-shrink-0 flex items-center gap-1.5"
              >
                {isAiLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Search className="w-4 h-4" />}
                <span className="hidden md:inline text-sm font-semibold">
                  {isAiLoading ? "Düşünüyor..." : "Ara"}
                </span>
              </button>
            </form>

            {/* SAĞ EYLEMLER */}
            <div className="flex items-center gap-1 flex-shrink-0">

              {/* Giriş / Profil */}
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

              {/* Sepet */}
              <Link
                href="/cart"
                id="navbar-cart-btn"
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-blue-700" />
                  {mounted && cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[16px] h-4 px-0.5 rounded-full bg-orange-500 text-[9px] font-bold text-white">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
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
            KATMAN 2: MEGA MENÜ KATEGORİ BARI (masaüstü)
            ============================================================ */}
        <div className="bg-gray-100 border-b border-gray-200 hidden lg:block">
          <div className="max-w-[1340px] mx-auto px-4">
            <nav className="flex items-stretch justify-center h-10 relative">

              {/* 🔥 Fırsatlar — özel link (her zaman ilk) */}
              <Link
                href="/products?onlyDiscount=1"
                className="flex-shrink-0 px-4 h-full flex items-center text-[13px] font-bold text-red-600
                           hover:bg-white hover:text-red-700 border-b-2 border-transparent hover:border-red-600
                           transition-all duration-150 whitespace-nowrap"
              >
                🔥 Fırsatlar
              </Link>

              {/* MEGA MENÜ GRUPLARI */}
              {Object.entries(groups).map(([groupName, items]) => (
                <div key={groupName} className="relative flex-shrink-0" onMouseLeave={() => setOpenGroup(null)}>
                  <button
                    onClick={() => toggleGroup(groupName)}
                    onMouseEnter={() => setOpenGroup(groupName)}
                    className={`px-4 h-full flex items-center gap-1 text-[13px] font-medium
                               border-b-2 border-transparent transition-all duration-150 whitespace-nowrap
                               ${openGroup === groupName
                        ? "bg-white text-blue-700 border-blue-700"
                        : "text-gray-700 hover:bg-white hover:text-blue-700 hover:border-blue-700"
                      }`}
                  >
                    {groupName}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${openGroup === groupName ? "rotate-180" : ""}`} />
                  </button>

                  {/* Mega Dropdown */}
                  <MegaMenuDropdown
                    groupName={groupName}
                    items={items}
                    isOpen={openGroup === groupName}
                    onClose={() => setOpenGroup(null)}
                  />
                </div>
              ))}

              {/* Gruba girmeyen tekil kategoriler */}
              {standalone.map(cat => (
                <Link
                  key={cat.name}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="flex-shrink-0 px-4 h-full flex items-center text-[13px] font-medium text-gray-700
                             hover:bg-white hover:text-blue-700 border-b-2 border-transparent hover:border-blue-700
                             transition-all duration-150 whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ============================================================
          MOBİL MENÜ (drawer)
          ============================================================ */}
      {isMobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setIsMobileOpen(false)} />
          <div ref={mobileMenuRef} className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-lg max-h-[70vh] overflow-y-auto">
            <nav className="flex flex-col py-2">

              <div className="px-6 py-4 border-b border-gray-100 lg:hidden">
                <form
                  onSubmit={async (e) => {
                    await handleSearch(e);
                    setIsMobileOpen(false);
                  }}
                  className="flex items-stretch h-10 rounded-md overflow-hidden
                             border border-gray-300 hover:border-blue-500
                             focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100
                             transition-all"
                >
                  <div className="flex items-center pl-3 pr-1 bg-white">
                    {isAiLoading
                      ? <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                      : <Sparkles className="w-4 h-4 text-purple-400" />}
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="AI ile ara..."
                    disabled={isAiLoading}
                    className="flex-1 px-2 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isAiLoading}
                    className="px-4 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white transition-colors flex-shrink-0 flex items-center justify-center"
                  >
                    {isAiLoading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Search className="w-4 h-4" />}
                  </button>
                </form>
              </div>

              <Link href="/products?onlyDiscount=1" onClick={() => setIsMobileOpen(false)}
                className="px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-50 border-b border-gray-100">
                🔥 Fırsatlar
              </Link>

              {/* Gruplar — genişleyebilir */}
              {Object.entries(groups).map(([groupName, items]) => (
                <div key={groupName} className="border-b border-gray-100">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenGroup(openGroup === groupName ? null : groupName);
                    }}
                    className="w-full flex items-center justify-between px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    {groupName}
                    <ChevronDown className={`w-4 h-4 transition-transform ${openGroup === groupName ? "rotate-180" : ""}`} />
                  </button>
                  {openGroup === groupName && (
                    <div className="bg-gray-50 pl-8 pr-4 py-1 flex flex-col gap-0.5">
                      {items.map(cat => (
                        <Link key={cat.name} href={`/products?category=${encodeURIComponent(cat.name)}`}
                          onClick={() => setIsMobileOpen(false)}
                          className="py-2 text-sm text-gray-600 hover:text-blue-700 transition-colors border-b border-gray-100 last:border-none">
                          {cat.name}
                          <span className="ml-2 text-[11px] text-gray-400">({cat.productCount})</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Tekil kategoriler */}
              {standalone.map(cat => (
                <Link key={cat.name} href={`/products?category=${encodeURIComponent(cat.name)}`}
                  onClick={() => setIsMobileOpen(false)}
                  className="px-6 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-b border-gray-100 transition-colors">
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
