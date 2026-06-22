/**
 * lib/api/axios-instance.ts
 * -------------------------
 * Temel Axios instance — sunucu tarafı (SSR/RSC) ve tarayıcı tarafı
 * kodlarının her ikisi de bu instance'ı kullanabilir.
 *
 * Bu dosya Clerk'e bağımlı DEĞİLDİR; token enjeksiyonu dışarıdan yapılır.
 * Bu ayrım önemlidir: Clerk hook'ları yalnızca Client Component'larda
 * çalışır; bu dosya ise her ortamda import edilebilir.
 *
 * Token Enjeksiyon Stratejisi:
 *   - Client Component → useApiClient() hook'u (aşağıda)
 *   - Server Component (RSC) → getToken() ile doğrudan header eklenir
 */


/*
Eğer bu dosyayı eklemeseydik, projenin içindeki 50 farklı sayfada, 50 kere ürün çekmek 
veya bir şey yollamak için şöyle iğrenç ve uzun kodlar yazmak zorunda kalacaktık:

axios.get("http://localhost:8080/api/v1/products", {
    headers: { "Content-Type": "application/json" },
    timeout: 10000
}).catch(err => {
    // Hatayı yakala, mesajı ayıkla, konsola yaz...
})

Bu dosya aslında bir "Merkezi Karargah (Instance)" oluşturuyor. Diyor ki: "Ben bir Axios kopyası oluşturuyorum.
Bütün varsayılan ayarları buraya yazıyorum. Kim Backend'e istek atacaksa beni çağırsın."

// axios-instance sayesinde artık sadece bu kadar yazıyoruz:
apiClient.get("/products")
*/

import axios from "axios";

/** Backend base URL — .env.local'dan okunur, yoksa localhost fallback */
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

/**
 * Merkezi Axios instance.
 *
 * baseURL: Tüm isteklere otomatik olarak eklenir.
 *   Örn: api.get('/products') → GET http://localhost:8080/api/v1/products
 *
 * timeout: 10 saniye bekleyip cevap gelmezse hata fırlatır.
 *   Bu, donmuş isteklerin uygulamayı askıda bırakmasını önler.
 *
 * headers:
 *   Content-Type: JSON body gönderen tüm istekler için varsayılan.
 */

// create = "Bana Axios'un yepyeni, tamamen bağımsız ve özel ayarlanmış bir kopyasını oluştur" demektir.
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Response interceptor — hata durumlarını merkezi ele alır.
 *
 * İSTEK BAŞARILI → veriyi olduğu gibi ilet.
 * İSTEK BAŞARISIZ → hata nesnesini zenginleştirip tekrar fırlat.
 *
 * Bu interceptor sayesinde her bileşende try/catch bloğu yazmak yerine
 * tek bir noktada hata işleme yapılır.
 */
apiClient.interceptors.response.use(
  // Başarılı yanıt: aynen geçir
  (response) => response,

  // Hata yanıtı: zenginleştir ve tekrar fırlat
  (error) => {
    if (error.response) {
      /**
       * Sunucu yanıt verdi ama hata kodu döndü (4xx, 5xx).
       * Backend'in ErrorResponse formatına uygun mesajı yakala.
       * error.response.data → GlobalExceptionHandler'ın döndürdüğü nesne.
       */
      const serverMessage: string =
        error.response.data?.message ?? "Bir sunucu hatası oluştu.";

      console.error(
        `[API] ${error.response.status} ${error.config?.url} — ${serverMessage}`
      );
    } else if (error.request) {
      /**
       * İstek gönderildi ama sunucudan hiç yanıt gelmedi.
       * Olası nedenler: ağ kesintisi, CORS, backend çalışmıyor.
       */
      console.error("[API] Sunucudan yanıt alınamadı:", error.request);
    } else {
      /** İstek oluşturulurken hata oluştu (kod hatası vb.) */
      console.error("[API] İstek hatası:", error.message);
    }

    // Hatayı bileşene ilet; bileşen kendi UI'ını yönetsin
    return Promise.reject(error);
  }
);

export default apiClient;
