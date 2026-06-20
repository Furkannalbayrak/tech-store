package com.techstore.backend.api.advice;

import java.time.Instant;

/**
 * Standart API Hata Yanıt DTO'su.
 *
 * Tüm hata yanıtları bu yapıda döndürülür; böylece frontend
 * tutarlı bir hata formatını güvenle işleyebilir:
 *
 *   {
 *     "timestamp":  "2026-06-20T07:15:00Z",
 *     "status":     404,
 *     "error":      "Not Found",
 *     "message":    "Ürün bulunamadı: apple-macbook-pro-16",
 *     "path":       "/api/v1/products/apple-macbook-pro-16"
 *   }
 *
 * Spring 6'nın yerleşik ProblemDetail (RFC 7807) yerine bu özel
 * yapı tercih edildi; çünkü Türkçe mesajlar ve özel alanlar için
 * tam kontrol sağlar ve frontend ile sözleşme (contract) nettir.
 *
 * @param timestamp Hatanın oluşma zamanı (UTC, ISO-8601)
 * @param status    HTTP durum kodu (örn. 404, 400, 500)
 * @param error     HTTP durum adı (örn. "Not Found", "Bad Request")
 * @param message   Kullanıcıya veya geliştiriciye açıklayıcı hata mesajı
 * @param path      Hatanın oluştuğu istek URL'si
 */
public record ErrorResponse(
        Instant timestamp,
        int     status,
        String  error,
        String  message,
        String  path
) {}
