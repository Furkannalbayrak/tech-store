/**
 * lib/data/placeholder-products.ts
 * ----------------------------------
 * Backend çevrimdışıyken UI testleri için gerçekçi placeholder verisi.
 * ProductSummary ve ProductDetail tipleri birebir yansıtılmıştır.
 * Production'da bu dosyaya hiç ulaşılmaz; backend her zaman gerçek veriyi döndürür.
 */

import type { ProductSummary, ProductDetail } from "@/lib/types/api.types";

// ---------------------------------------------------------------------------
// 24 ÜRÜN — Farklı kategori, marka ve fiyat aralıkları
// ---------------------------------------------------------------------------
export const PLACEHOLDER_SUMMARY_PRODUCTS: ProductSummary[] = [
  // ---- LAPTOP ----
  { id:"p-001", name:"Apple MacBook Pro 16\" M4 Pro", slug:"apple-macbook-pro-16-m4-pro", shortDescription:"M4 Pro çip · 48GB RAM · 512GB SSD · 22 saat pil", price:89999, discountedPrice:74999, brand:"Apple", category:"Laptop", stockQuantity:12, thumbnailUrl:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80", isFeatured:true, createdAt:new Date().toISOString() },
  { id:"p-002", name:"ASUS ROG Zephyrus G16 RTX 4090", slug:"asus-rog-zephyrus-g16-rtx4090", shortDescription:"RTX 4090 · Intel i9 · 32GB DDR5 · 2TB SSD", price:119999, discountedPrice:null, brand:"ASUS", category:"Laptop", stockQuantity:5, thumbnailUrl:"https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80", isFeatured:true, createdAt:new Date().toISOString() },
  { id:"p-003", name:"Lenovo ThinkPad X1 Carbon Gen 12", slug:"lenovo-thinkpad-x1-carbon-gen12", shortDescription:"Intel Core Ultra 7 · 32GB RAM · 1TB SSD · 1.12 kg", price:74999, discountedPrice:65999, brand:"Lenovo", category:"Laptop", stockQuantity:8, thumbnailUrl:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  { id:"p-004", name:"Dell XPS 15 OLED 2024", slug:"dell-xps-15-oled-2024", shortDescription:"RTX 4060 · Intel i9 · 64GB RAM · 4K OLED", price:89999, discountedPrice:null, brand:"Dell", category:"Laptop", stockQuantity:3, thumbnailUrl:"https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  { id:"p-005", name:"MSI Titan GT77 HX", slug:"msi-titan-gt77-hx-rtx4090", shortDescription:"RTX 4090 · Intel i9-13980HX · 64GB · 4TB RAID", price:134999, discountedPrice:124999, brand:"MSI", category:"Laptop", stockQuantity:2, thumbnailUrl:"https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80", isFeatured:true, createdAt:new Date().toISOString() },
  { id:"p-006", name:"HP Spectre x360 16\" OLED", slug:"hp-spectre-x360-16-oled", shortDescription:"Intel Core Ultra 7 · 32GB · 2TB · 360° Dokunmatik", price:59999, discountedPrice:52999, brand:"HP", category:"Laptop", stockQuantity:15, thumbnailUrl:"https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  // ---- SMARTPHONE ----
  { id:"p-007", name:"iPhone 16 Pro Max 512GB", slug:"apple-iphone-16-pro-max-512gb", shortDescription:"A18 Pro çip · 48MP kamera · Titanyum · USB-C 3.0", price:65999, discountedPrice:null, brand:"Apple", category:"Akıllı Telefon", stockQuantity:28, thumbnailUrl:"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80", isFeatured:true, createdAt:new Date().toISOString() },
  { id:"p-008", name:"Samsung Galaxy S25 Ultra 512GB", slug:"samsung-galaxy-s25-ultra-512gb", shortDescription:"Snapdragon 8 Elite · 200MP · S Pen · 5000mAh", price:59999, discountedPrice:54999, brand:"Samsung", category:"Akıllı Telefon", stockQuantity:20, thumbnailUrl:"https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80", isFeatured:true, createdAt:new Date().toISOString() },
  { id:"p-009", name:"Xiaomi 14 Ultra 512GB", slug:"xiaomi-14-ultra-512gb", shortDescription:"Snapdragon 8 Gen 3 · Leica kamera · 90W hızlı şarj", price:34999, discountedPrice:31999, brand:"Xiaomi", category:"Akıllı Telefon", stockQuantity:35, thumbnailUrl:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  { id:"p-010", name:"Samsung Galaxy Z Fold 6 512GB", slug:"samsung-galaxy-z-fold6-512gb", shortDescription:"Katlanabilir · 7.6\" iç ekran · Snapdragon 8 Elite", price:79999, discountedPrice:null, brand:"Samsung", category:"Akıllı Telefon", stockQuantity:10, thumbnailUrl:"https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  // ---- GPU ----
  { id:"p-011", name:"NVIDIA GeForce RTX 5090 24GB", slug:"nvidia-rtx-5090-founders-edition", shortDescription:"24GB GDDR7 · DLSS 4 · Ada Lovelace Next · 450W", price:94999, discountedPrice:null, brand:"NVIDIA", category:"Ekran Kartı", stockQuantity:3, thumbnailUrl:"https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=80", isFeatured:true, createdAt:new Date().toISOString() },
  { id:"p-012", name:"NVIDIA GeForce RTX 5080 16GB", slug:"nvidia-rtx-5080-founders-edition", shortDescription:"16GB GDDR7 · DLSS 4 · 320W TDP · PCIe 5.0", price:64999, discountedPrice:54999, brand:"NVIDIA", category:"Ekran Kartı", stockQuantity:7, thumbnailUrl:"https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  { id:"p-013", name:"AMD Radeon RX 9070 XT 16GB", slug:"amd-radeon-rx-9070-xt-16gb", shortDescription:"16GB GDDR6 · FSR 4.0 · Ray Tracing · 190W", price:24999, discountedPrice:22999, brand:"AMD", category:"Ekran Kartı", stockQuantity:12, thumbnailUrl:"https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  // ---- MONITOR ----
  { id:"p-014", name:"LG UltraGear 27\" 4K OLED 240Hz", slug:"lg-ultragear-27-4k-oled-240hz", shortDescription:"4K OLED · 240Hz · 0.03ms · G-Sync · HDR 1000", price:34999, discountedPrice:29999, brand:"LG", category:"Monitör", stockQuantity:9, thumbnailUrl:"https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  { id:"p-015", name:"Samsung Odyssey G9 49\" OLED", slug:"samsung-odyssey-g9-49-oled-240hz", shortDescription:"49\" DQHD · 240Hz · 1000R eğimli · HDR2000", price:49999, discountedPrice:null, brand:"Samsung", category:"Monitör", stockQuantity:6, thumbnailUrl:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  { id:"p-016", name:"ASUS ProArt PA32UCG-K 32\" 4K", slug:"asus-proart-pa32ucg-k-32-4k", shortDescription:"4K IPS · 120Hz · DCI-P3 %99 · Mini LED · HDR1600", price:64999, discountedPrice:59999, brand:"ASUS", category:"Monitör", stockQuantity:4, thumbnailUrl:"https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  // ---- ACCESSORIES ----
  { id:"p-017", name:"Logitech MX Keys S Kablosuz", slug:"logitech-mx-keys-s-wireless", shortDescription:"Düşük profil mekanik · Bluetooth · USB-C şarj · 5 cihaz", price:3499, discountedPrice:2999, brand:"Logitech", category:"Klavye & Mouse", stockQuantity:50, thumbnailUrl:"https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  { id:"p-018", name:"Keychron Q3 Max Mekanik Klavye", slug:"keychron-q3-max-mechanical", shortDescription:"Gateron Jupiter Red · QMK/VIA · RGB · Alüminyum gövde", price:7999, discountedPrice:null, brand:"Keychron", category:"Klavye & Mouse", stockQuantity:22, thumbnailUrl:"https://images.unsplash.com/photo-1561921177-a22e8de5a8a5?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  // ---- STORAGE ----
  { id:"p-019", name:"Samsung 990 Pro 2TB NVMe SSD", slug:"samsung-990-pro-2tb-nvme", shortDescription:"PCIe 4.0 · 7450 MB/s okuma · PS5 uyumlu · RGB", price:4299, discountedPrice:3499, brand:"Samsung", category:"SSD & Depolama", stockQuantity:80, thumbnailUrl:"https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  { id:"p-020", name:"Kingston Fury Beast 32GB DDR5-6000", slug:"kingston-fury-beast-32gb-ddr5", shortDescription:"32GB (2×16GB) · DDR5-6000 · CL30 · RGB", price:2999, discountedPrice:null, brand:"Kingston", category:"RAM", stockQuantity:45, thumbnailUrl:"https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  { id:"p-021", name:"WD Black SN850X 2TB PS5/PC", slug:"wd-black-sn850x-2tb", shortDescription:"PCIe 4.0 · 7300 MB/s · PS5 & PC · 5 yıl garanti", price:3999, discountedPrice:3299, brand:"WD", category:"SSD & Depolama", stockQuantity:60, thumbnailUrl:"https://images.unsplash.com/photo-1588702547923-7408785919c3?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  // ---- HEADPHONE ----
  { id:"p-022", name:"Sony WH-1000XM6 Kablosuz", slug:"sony-wh-1000xm6-wireless", shortDescription:"Aktif gürültü engelleme · 35 saat pil · Hi-Res Audio", price:14999, discountedPrice:12999, brand:"Sony", category:"Kulaklık", stockQuantity:18, thumbnailUrl:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  { id:"p-023", name:"Razer BlackShark V2 Pro 2024", slug:"razer-blackshark-v2-pro-2024", shortDescription:"Kablosuz · THX Spatial Audio · 70 saat pil · 2.4GHz", price:5499, discountedPrice:4999, brand:"Razer", category:"Kulaklık", stockQuantity:30, thumbnailUrl:"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
  // ---- TABLET ----
  { id:"p-024", name:"Apple iPad Pro 13\" M4 WiFi 256GB", slug:"apple-ipad-pro-13-m4-wifi", shortDescription:"Ultra Retina XDR OLED · M4 çip · 16GB RAM · Apple Pencil Pro", price:64999, discountedPrice:59999, brand:"Apple", category:"Tablet", stockQuantity:0, thumbnailUrl:"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80", isFeatured:false, createdAt:new Date().toISOString() },
];

// ---------------------------------------------------------------------------
// DETAY VERİSİ — /products/[slug] için
// ---------------------------------------------------------------------------
export function getPlaceholderDetail(slug: string): ProductDetail | null {
  const summary = PLACEHOLDER_SUMMARY_PRODUCTS.find(p => p.slug === slug);
  if (!summary) return null;

  return {
    id: summary.id,
    name: summary.name,
    slug: summary.slug,
    shortDescription: summary.shortDescription,
    description: `${summary.name}, ${summary.brand}'ın en üst segmentinde yer alan premium bir üründür. ` +
      `Üstün donanımı ve ergonomik tasarımıyla profesyonellerden oyunculara kadar geniş bir kitleye hitap eder. ` +
      `Gelişmiş soğutma sistemi, uzun pil ömrü ve geniş ekosistem desteğiyle rakiplerinden ayrışır. ` +
      `Her ayrıntısı özenle tasarlanan bu ürün, uzun yıllar boyunca yüksek performans sunmak için mühendislenmiştir.`,
    price: summary.price,
    discountedPrice: summary.discountedPrice,
    brand: summary.brand,
    category: summary.category,
    stockQuantity: summary.stockQuantity,
    imageUrls: [
      summary.thumbnailUrl ?? "",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
    ].filter(Boolean),
    attributes: {
      "İşlemci": summary.category === "Laptop" ? "Intel Core Ultra 7 / Apple M4 Pro" : "—",
      "RAM": summary.category === "Laptop" ? "32GB DDR5" : "—",
      "Depolama": summary.category === "Laptop" ? "1TB NVMe SSD" : "—",
      "Ekran": summary.category === "Laptop" ? "16\" Liquid Retina XDR" : "—",
      "Garanti": "2 Yıl Türkiye Garantisi",
      "Renk": "Uzay Siyahı",
      "Ağırlık": summary.category === "Laptop" ? "2.14 kg" : "—",
    },
    isFeatured: summary.isFeatured,
    isActive: true,
    createdAt: summary.createdAt,
    updatedAt: summary.createdAt,
  };
}

// ---------------------------------------------------------------------------
// YARDIMCI: Ürün ID'sinden tutarlı meta veri üret
// ---------------------------------------------------------------------------
export function getProductMeta(id: string) {
  const sum = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    rating: Math.round((3.5 + (sum % 16) / 10) * 10) / 10, // 3.5–5.0
    reviewCount: 50 + (sum % 450),                           // 50–499
    hasFastDelivery: sum % 3 !== 0,                          // ~%67
    hasFreeShipping: true,
    deliveryDays: sum % 2 === 0 ? "Yarın" : "2 Gün İçinde",
  };
}
