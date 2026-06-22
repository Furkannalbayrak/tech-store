"use client";

/**
 * lib/api/use-api-client.ts
 * -------------------------
 * Clerk JWT token'ını otomatik ekleyen Axios hook'u.
 *
 * NEDEN HOOK?
 * Clerk'in useAuth() hook'u yalnızca React Client Component'larında
 * çalışır. Bu hook, temel Axios instance'ını alıp üzerine bir
 * request interceptor ekleyerek her isteğe Bearer token enjekte eder.
 *
 * KULLANIM (Client Component'ta):
 *   const api = useApiClient();
 *   const { data } = await api.get<UserResponse>('/users/me');
 *
 * INTERCEPTOR YAŞAM DÖNGÜSÜ:
 * Hook her render'da yeni interceptor eklemez; useMemo ile
 * interceptor yalnızca bir kez kurulur ve temizleme fonksiyonu
 * ile component unmount edildiğinde kaldırılır (bellek sızıntısı önleme).
 */

import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import apiClient from "./axios-instance";

export function useApiClient() {
  const { getToken } = useAuth();

  /**
   * useMemo: Bağımlılıklar değişmediği sürece interceptor'lı
   * client'ı yeniden oluşturmaz. getToken referansı değişirse
   * yeni interceptor kurulur.
   */
  const authenticatedClient = useMemo(() => {
    /**
     * REQUEST INTERCEPTOR — Her istekten önce çalışır.
     *
     * 1. Clerk'ten geçerli JWT token'ı iste (getToken async'tir).
     * 2. Token varsa "Authorization: Bearer <token>" başlığını ekle.
     * 3. Token yoksa (kullanıcı giriş yapmamış) başlık eklenmez;
     *    public endpoint'ler token olmadan çalışır.
     *
     * Clerk'in getToken() davranışı:
     *   - Oturum varsa geçerli token'ı döndürür (cache'den).
     *   - Token süresi dolmuşsa otomatik yeniler (refresh).
     *   - Oturum yoksa null döndürür.
     */

    // apiClient üzerinden backende bir istek atıldığında ilk önce buraya geliyor
    // burada istek backende gitmeden önce üzerine token etiketi yapıştırılıp öyle gönderiliyor
    // çünkü backend bunu yani tokeni kontrol edicek

    const interceptorId = apiClient.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            // Authorization header'ı ekle
            config.headers["Authorization"] = `Bearer ${token}`;
          }
        } catch (err) {
          // Token alınamazsa isteği yine de gönder (public endpoint olabilir)
          console.warn("[useApiClient] Token alınamadı:", err);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    /**
     * Temizleme objesi: Bileşen unmount edildiğinde interceptor kaldırılır.
     * Bu olmazsa her render'da yeni interceptor birikir ve
     * her istekte N kez token eklenmeye çalışılır.
     */

    // "React sayfayı her güncellediğinde, yola yeni bir memur dikmeden önce eski memuru görevden al (eject)."
    return {
      client: apiClient,
      cleanup: () => {
        apiClient.interceptors.request.eject(interceptorId);
      },
    };
  }, [getToken]);

  return authenticatedClient.client;
}
