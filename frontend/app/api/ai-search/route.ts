/**
 * app/api/ai-search/route.ts
 * -------------------------------------------------
 * POST /api/ai-search
 *
 * Kullanıcının doğal dil arama sorgusunu (Türkçe) alır,
 * Google Gemini'a gönderir ve yapılandırılmış bir ürün
 * filtresi JSON'u döndürür.
 *
 * İstek  : { query: string }
 * Yanıt  : { category?, keyword?, minPrice?, maxPrice?, brand?, onlyDiscount? }
 *
 * Güvenlik:
 *  - GEMINI_API_KEY sunucu tarafında kalır, client'a sızdırılmaz
 *  - API key yoksa graceful hata döner
 */

import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

/* ============================================================
   TİPLER
   ============================================================ */
interface AiSearchFilters {
    category?: string | null;
    keyword?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    brand?: string | null;
    onlyDiscount?: boolean | null;
}

/* ============================================================
   SİSTEM PROMPTU
   Mevcut kategori listesi backend /categories endpoint'inden
   alınıyor; burası sabit liste — yeni kategori eklenirse güncelle.
   ============================================================ */
const SYSTEM_PROMPT = `Sen bir Türk teknoloji e-ticaret sitesi için akıllı arama filtresi oluşturan asistansın.

Kullanıcı Türkçe yazıyor. Verilen sorguyu analiz edip SADECE aşağıdaki JSON formatında yanıt ver.
Başka hiçbir şey yazma, sadece JSON döndür.

Çıktı formatı:
{
  "category": "<kategori adı veya null>",
  "keyword": "<arama anahtar kelimesi veya null>",
  "minPrice": <minimum fiyat TL cinsinden sayı veya null>,
  "maxPrice": <maksimum fiyat TL cinsinden sayı veya null>,
  "brand": "<marka adı veya null>",
  "onlyDiscount": <true eğer sadece indirimli ürünler isteniyorsa, aksi hâlde false>
}

Mevcut kategori listesi (sadece bu isimlerden birini kullan, yoksa null):
- Laptop
- Akıllı Telefon
- Tablet
- Kulaklık
- Monitör
- Klavye
- Mouse
- Kamera
- TV
- Oyun Konsolu
- Akıllı Saat
- Ses Sistemi
- Yazıcı
- Depolama

Fiyat kuralları:
- "bin" → 1000, "iki bin" → 2000, "5k" → 5000 gibi dönüştür
- "altı", "aşağısı", "ucuz", "bütçe dostu" → maxPrice belirle
- "üzeri", "pahalı", "premium" → minPrice belirle
- Fiyat belirtilmemişse null bırak

Marka kuralları:
- "apple", "iphone", "macbook", "ipad", "airpod" → brand: "Apple"
- "samsung", "galaxy" → brand: "Samsung"
- "sony" → brand: "Sony"
- "lg" → brand: "LG"
- "asus", "rog" → brand: "Asus"
- "lenovo", "thinkpad" → brand: "Lenovo"
- "dell" → brand: "Dell"
- "hp" → brand: "HP"
- "microsoft", "surface" → brand: "Microsoft"
- "huawei" → brand: "Huawei"
- "xiaomi", "mi", "redmi" → brand: "Xiaomi"

Örnekler:
- "2000 lira altı oyun laptopı" → {"category":"Laptop","keyword":"oyun","maxPrice":2000,"minPrice":null,"brand":null,"onlyDiscount":false}
- "apple kulaklık" → {"category":"Kulaklık","keyword":null,"minPrice":null,"maxPrice":null,"brand":"Apple","onlyDiscount":false}
- "indirimli samsung telefon" → {"category":"Akıllı Telefon","keyword":null,"minPrice":null,"maxPrice":null,"brand":"Samsung","onlyDiscount":true}
- "ucuz klavye mouse" → {"category":null,"keyword":"klavye mouse","minPrice":null,"maxPrice":500,"brand":null,"onlyDiscount":false}
- "50000 üzeri gaming monitör" → {"category":"Monitör","keyword":"gaming","minPrice":50000,"maxPrice":null,"brand":null,"onlyDiscount":false}
`;

/* ============================================================
   ROUTE HANDLER
   ============================================================ */
export async function POST(req: NextRequest) {
    try {
    // API key kontrolu
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "buraya_groq_keyini_yaz") {
      return NextResponse.json(
        { error: "GROQ_API_KEY tanimli degil" },
        { status: 503 }
      );
    }

        // İstek body'sini parse et
        const body = await req.json();
        const query: string = body?.query?.trim();

        if (!query || query.length < 2) {
            return NextResponse.json(
                { error: "Gecersiz sorgu" },
                { status: 400 }
            );
        }

    // Groq istemcisi
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 256,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Kullanici sorgusu: "${query}"` },
      ],
    });
    const rawText = completion.choices[0]?.message?.content?.trim() ?? "";

        // JSON parse — AI bazen ``` bloğu içinde döndürür
        let filters: AiSearchFilters;
        try {
            const jsonText = rawText
                .replace(/^```json\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/\s*```$/i, "")
                .trim();

            filters = JSON.parse(jsonText);
        } catch {
            console.error("[ai-search] JSON parse hatası. Ham metin:", rawText);
            filters = { keyword: query };
        }

        // null değerleri temizle
        const cleaned: AiSearchFilters = {};
        if (filters.category) cleaned.category = filters.category;
        if (filters.keyword) cleaned.keyword = filters.keyword;
        if (filters.brand) cleaned.brand = filters.brand;
        if (filters.minPrice != null) cleaned.minPrice = filters.minPrice;
        if (filters.maxPrice != null) cleaned.maxPrice = filters.maxPrice;
        if (filters.onlyDiscount === true) cleaned.onlyDiscount = true;

        return NextResponse.json(cleaned);
    } catch (err) {
        console.error("[ai-search] Hata:", err);
        return NextResponse.json(
            { error: "AI servisi su an kullanilamiyor" },
            { status: 500 }
        );
    }
}
