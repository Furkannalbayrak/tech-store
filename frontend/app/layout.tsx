import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/* ============================================================
   SEO METADATA
   ============================================================ */
export const metadata: Metadata = {
  title: {
    template: "%s | TechStore — Türkiye'nin Teknoloji Hipermarketi",
    default: "TechStore — Laptop, Telefon, PC Bileşeni ve Daha Fazlası",
  },
  description:
    "Türkiye'nin en büyük teknoloji mağazası. 50.000'den fazla ürün: laptop, akıllı telefon, ekran kartı, monitör, klavye, kulaklık ve daha fazlası. Güvenli ödeme, hızlı teslimat.",
  keywords: ["laptop", "akıllı telefon", "ekran kartı", "monitör", "teknoloji", "bilgisayar"],
  authors: [{ name: "TechStore" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "TechStore",
    title: "TechStore — Türkiye'nin Teknoloji Hipermarketi",
    description: "50.000+ ürün, güvenli ödeme, hızlı teslimat.",
  },
};

/* ============================================================
   ROOT LAYOUT
   ============================================================
   Zustand store provider gerektirmez — doğrudan hook kullanılır.
   ============================================================ */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className="antialiased min-h-screen flex flex-col bg-gray-100 text-gray-900">
        <ClerkProvider>
          {/* İki katlı mega navbar — sayfanın üstünde sabit */}
          <Navbar />

          {/* Navbar yüksekliği kadar boşluk: Mobil/Tablet ~65px, Masaüstü ~112px */}
          <div className="h-[65px] lg:h-[112px]" aria-hidden="true" />

          {/* Sayfa içeriği */}
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
