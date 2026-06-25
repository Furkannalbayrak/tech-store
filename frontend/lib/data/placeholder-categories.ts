/**
 * lib/data/placeholder-categories.ts
 * ------------------------------------
 * Backend çevrimdışıyken Navbar Mega Menüsü için kullanılan statik kategori listesi.
 * Supabase'deki gerçek kategori yapısıyla eşleştirilmiştir.
 */

import type { CategoryInfo } from "@/lib/types/api.types";

export const PLACEHOLDER_CATEGORIES: CategoryInfo[] = [
  // Bilgisayar & Donanım grubu
  { name: "Laptop",          productCount: 230 },
  { name: "Masaüstü PC",     productCount: 95  },
  { name: "Ekran Kartı",     productCount: 78  },
  { name: "İşlemci",         productCount: 62  },
  { name: "RAM",             productCount: 55  },
  { name: "Anakart",         productCount: 43  },
  { name: "Güç Kaynağı",     productCount: 38  },
  { name: "PC Kasası",       productCount: 31  },

  // Depolama grubu
  { name: "SSD & Depolama",  productCount: 88  },

  // Telefon & Tablet grubu
  { name: "Akıllı Telefon",  productCount: 185 },
  { name: "Tablet",          productCount: 47  },

  // Ses & Görüntü grubu
  { name: "Monitör",         productCount: 72  },
  { name: "Kulaklık",        productCount: 84  },
  { name: "Hoparlör",        productCount: 29  },
  { name: "TV",              productCount: 18  },

  // Çevre Birimleri grubu
  { name: "Klavye & Mouse",  productCount: 65  },
  { name: "Webcam",          productCount: 22  },
  { name: "Yazıcı",          productCount: 17  },

  // Ağ & Güvenlik grubu
  { name: "Ağ Ürünleri",     productCount: 41  },

  // Tekil (gruba girmeyen)
  { name: "Aksesuarlar",     productCount: 156 },
  { name: "Oyun Konsolları", productCount: 24  },
  { name: "Soğutma",         productCount: 33  },
];
