import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// ---------------------------------------------------------------------------
// SEO METADATA
// ---------------------------------------------------------------------------
export const metadata: Metadata = {
  title: {
    /** %s → Sayfa başlığı şablonu: "Laptoplar | TechStore" şeklinde oluşur */
    template: "%s | TechStore",
    default: "TechStore — Premium Teknoloji Mağazası",
  },
  description:
    "Türkiye'nin en kapsamlı teknoloji mağazası. Laptop, akıllı telefon, ekran kartı ve daha fazlası — hızlı teslimat, güvenli alışveriş.",
  keywords: ["laptop", "akıllı telefon", "ekran kartı", "teknoloji", "bilgisayar"],
  authors: [{ name: "TechStore" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "TechStore",
    title: "TechStore — Premium Teknoloji Mağazası",
    description: "Türkiye'nin en kapsamlı teknoloji mağazası.",
  },
};

// ---------------------------------------------------------------------------
// ROOT LAYOUT
// ---------------------------------------------------------------------------
/**
 * Tüm sayfaların sarmalandığı kök düzen bileşeni.
 *
 * YAPILANMA:
 *   ClerkProvider (kimlik doğrulama bağlamı)
 *     └─ Navbar (sabit üst menü — dark, blur efektli)
 *     └─ <main> (sayfa içeriği — flex ile dolu yükseklik)
 *     └─ Footer (alt bilgi)
 *
 * dark sınıfı html etiketine eklendi: Tailwind'in dark: varyantı böyle aktif olur.
 * Tüm uygulama koyu tema üzerine inşa edilmiştir.
 *
 * antialiased: Metin render kalitesini artırır (subpixel anti-aliasing).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className="antialiased bg-zinc-950 text-zinc-100 min-h-screen flex flex-col">
        <ClerkProvider>
          {/* Sabit üst navigasyon çubuğu */}
          <Navbar />

          {/* Sayfa içeriği: Navbar ve Footer arasında esner */}
          <main className="flex-1">
            {children}
          </main>

          {/* Alt bilgi alanı */}
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
