/**
 * components/layout/Navbar.tsx
 * -----------------------------------------------
 * İKİ KATMANLI DİNAMİK MEGA NAVBAR
 *
 * Veri mimarisi:
 *  - NavbarServer (Server Component): backend'den kategorileri çeker
 *  - NavbarClient (Client Component): arama, mega menü, mobil drawer
 *
 * Mega Menü gruplaması (Vatan/Hepsiburada tarzı):
 *  - "Bilgisayar & Donanım"  → Laptop, Masaüstü PC, Ekran Kartı, RAM, SSD...
 *  - "Telefon & Tablet"      → Akıllı Telefon, Tablet...
 *  - "Ses & Görüntü"         → Monitör, Kulaklık, TV, Ses Sistemi...
 *  - "Çevre Birimleri"       → Klavye, Mouse, Yazıcı, Webcam...
 *  - "Ağ & Güvenlik"         → Modem, Router, Güvenlik...
 *  - Gruba girmeyen kategoriler → tek link olarak sıralanır
 */

import { Suspense } from "react";
import { getCategories } from "@/lib/api/product.service";
import type { CategoryInfo } from "@/lib/types/api.types";
import NavbarClient from "./NavbarClient";
import { PLACEHOLDER_CATEGORIES } from "@/lib/data/placeholder-categories";

/* ============================================================
   KATEGORİ GRUPLAMA MATRİSİ
   Supabase veritabanındaki kategori adlarıyla eşleşmeli.
   ============================================================ */
export const MEGA_GROUPS: Record<string, string[]> = {
  "Bilgisayar": [
    "DizǬstǬ Bilgisayar", "Dizüstü Bilgisayar",
    "MasaǬstǬ Bilgisayar", "Masaüstü Bilgisayar"
  ],
  "Telefon & Giyilebilir": [
    "Telefon", "Akıllı Telefon", "Cep Telefonu",
    "Giyilebilir Teknoloji", "Akıllı Saat"
  ],
  "Çevre Birimleri": [
    "Monitr", "Monitör",
    "Klavye", 
    "Mouse", "Mouse\r\n"
  ],
  "Bilgisayar Parçaları": [
    "Bile?enler", "Bileşenler", 
    "Depolama", "SSD", "HDD"
  ],
  "Ses & Görüntü": [
    "Ses", "Kulaklık", "Hoparlör",
    "Kamera", "Fotoğraf Makinesi"
  ],
  "Ağ & Ofis": [
    "A? ?rǬnleri", "Ağ Ürünleri", "Modem",
    "Yazc", "Yazıcı"
  ]
};

/**
 * Bir kategorinin hangi mega gruba ait olduğunu bulur.
 * Hiçbir gruba uymuyorsa null döner (tek link olarak gösterilir).
 */
export function findGroup(categoryName: string): string | null {
  for (const [groupName, members] of Object.entries(MEGA_GROUPS)) {
    if (members.some(m => m.toLowerCase() === categoryName.toLowerCase())) {
      return groupName;
    }
  }
  return null;
}

/* ============================================================
   SUNUCU BİLEŞENİ — Kategorileri fetch eder
   ============================================================ */
async function NavbarWithData() {
  let categories: CategoryInfo[] = PLACEHOLDER_CATEGORIES;

  try {
    const rawCategories = await getCategories();
    
    // Veritabanındaki hatalı/boşluklu kayıtları (örn: "Mouse\r\n" ve "Mouse") tekilleştirip birleştiriyoruz
    const mergedCats = new Map<string, CategoryInfo>();
    
    rawCategories.forEach(cat => {
      const cleanName = cat.name.trim(); // Görünmez boşluk/satır atlamalarını temizle
      if (mergedCats.has(cleanName)) {
        const existing = mergedCats.get(cleanName)!;
        existing.productCount += cat.productCount;
      } else {
        mergedCats.set(cleanName, { ...cat, name: cleanName });
      }
    });
    
    categories = Array.from(mergedCats.values());
  } catch {
    // Backend erişilemez — placeholder kullan
  }

  return <NavbarClient categories={categories} />;
}

/* ============================================================
   DEFAULT EXPORT — Suspense sarmalıyla
   ============================================================ */
export default function Navbar() {
  return (
    <Suspense fallback={<NavbarFallback />}>
      <NavbarWithData />
    </Suspense>
  );
}

/* ============================================================
   YÜKLEME ISKELET (Suspense fallback)
   ============================================================ */
function NavbarFallback() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="border-b border-gray-200">
        <div className="max-w-[1340px] mx-auto px-4 h-16 flex items-center gap-4">
          <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
          <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="bg-gray-100 border-b border-gray-200 h-10" />
    </header>
  );
}
