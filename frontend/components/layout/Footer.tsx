/**
 * components/layout/Footer.tsx
 * ----------------------------------------
 * Sade, beyaz arka planlı mega-market footer'ı.
 * Amazon/Vatan tarzı: link sütunları, küçük bilgi metinleri, telif.
 * Server Component — statik, hiç state yok.
 */

import Link from "next/link";
import { Cpu } from "lucide-react";

/* ============================================================
   SÜTUN VERİSİ
   ============================================================ */
const COLUMNS = [
  {
    title: "Kurumsal",
    links: [
      { label: "Hakkımızda",        href: "/about" },
      { label: "Kariyer",           href: "/careers" },
      { label: "Basın",             href: "/press" },
      { label: "Blog",              href: "/blog" },
      { label: "İletişim",          href: "/contact" },
    ],
  },
  {
    title: "Müşteri Hizmetleri",
    links: [
      { label: "Yardım Merkezi",    href: "/help" },
      { label: "Siparişlerim",      href: "/orders" },
      { label: "İade & Değişim",    href: "/returns" },
      { label: "Kargo Takibi",      href: "/tracking" },
      { label: "Fatura & Belge",    href: "/invoice" },
    ],
  },
  {
    title: "Alışveriş",
    links: [
      { label: "Tüm Ürünler",       href: "/products" },
      { label: "Kampanyalar",       href: "/products?onlyDiscount=1" },
      { label: "Markalar",          href: "/brands" },
      { label: "Çok Satanlar",      href: "/products" },
      { label: "Yeni Gelenler",     href: "/products?sort=newest" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { label: "Gizlilik Politikası",   href: "/privacy" },
      { label: "Kullanım Koşulları",    href: "/terms" },
      { label: "KVKK Aydınlatma",       href: "/kvkk" },
      { label: "Çerez Politikası",      href: "/cookies" },
      { label: "Mesafeli Satış",        href: "/distance-selling" },
    ],
  },
];

/* ============================================================
   ANA BİLEŞEN
   ============================================================ */
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-0">

      {/* ---- ÜST BÖLÜM: Sütunlar ---- */}
      <div className="max-w-[1340px] mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {COLUMNS.map(col => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-blue-700 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ---- ALT BÖLÜM: Telif ve logo ---- */}
      <div className="border-t border-gray-200">
        <div className="max-w-[1340px] mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded bg-blue-700">
              <Cpu className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="text-base font-extrabold text-blue-700">
              Tech<span className="text-orange-500">Store</span>
            </span>
          </Link>

          {/* Telif hakkı */}
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} TechStore Teknoloji A.Ş. Tüm hakları saklıdır.
          </p>

          {/* Ödeme yöntemleri */}
          <div className="flex items-center gap-2">
            {["VISA", "MC", "TROY", "3D"].map(pm => (
              <span
                key={pm}
                className="px-2 py-1 text-[10px] font-bold text-gray-500 border border-gray-300 rounded"
              >
                {pm}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
