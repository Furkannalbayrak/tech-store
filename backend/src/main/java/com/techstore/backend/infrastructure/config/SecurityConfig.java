package com.techstore.backend.infrastructure.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security Konfigürasyonu — Clerk JWT Entegrasyonu ile.
 *
 * MİMARİ YAKLAŞIM:
 * Bu uygulama bir "OAuth2 Resource Server" olarak yapılandırılmıştır.
 * Clerk, kullanıcı giriş yaptığında imzalı bir JWT token üretir.
 * Frontend bu token'ı her API isteğinde "Authorization: Bearer <token>" başlığında gönderir.
 * Spring Security bu token'ı Clerk'in JWKS endpoint'inden aldığı public key ile doğrular.
 *
 * GÜVENLİK KATMANLARI:
 *   1. CORS → Yalnızca izin verilen origin'lerden istek kabul et
 *   2. CSRF → Devre dışı (REST API + JWT stateless; CSRF session tabanlı saldırılara karşıdır)
 *   3. Session → STATELESS (JWT token'lar her istekte taşınır; sunucu session tutmaz)
 *   4. Authorization Rules → Endpoint bazında erişim kontrolü
 *   5. OAuth2 Resource Server → JWT imza doğrulaması
 *
 * ENDPOİNT YETKİ TABLOSU:
 *   GET  /api/v1/products/**   → permitAll (Vitrin herkese açık)
 *   POST /api/v1/products/**   → permitAll (Filtre endpoint'i herkese açık)
 *   POST /api/v1/webhooks/**   → permitAll (Clerk webhook; Svix imzası ile korunur)
 *   GET  /api/v1/users/me      → authenticated (JWT gerekli)
 *   Diğer her şey              → authenticated
 */
@Slf4j
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * application.properties'deki app.cors.allowed-origins değeri.
     * Virgülle ayrılmış origin listesi: "http://localhost:3000,https://techstore.com"
     */
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    /**
     * Ana güvenlik filtre zinciri (Security Filter Chain).
     *
     * Spring Security'nin her HTTP isteğini bu zincirden geçirir.
     * Zincir sırasıyla: CORS → CSRF → Oturum → Yetki kontrolleri → JWT doğrulaması
     *
     * @param http Spring Security'nin HttpSecurity yapılandırma nesnesi
     * @return Yapılandırılmış SecurityFilterChain bean'i
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ---------------------------------------------------------------
            // 1. CORS: Çapraz-Kaynak İstek Paylaşımı (Cross-Origin Resource Sharing)
            // ---------------------------------------------------------------
            // corsConfigurationSource() bean'ini kullan.
            // Bu olmadan tarayıcı, frontend'den gelen API isteklerini engeller.
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ---------------------------------------------------------------
            // 2. CSRF: Devre Dışı
            // ---------------------------------------------------------------
            // JWT ile korunan REST API'lerde CSRF saldırısı mümkün değildir.
            // CSRF token'lar session tabanlı uygulamalara özgüdür.
            // REST + JWT = stateless → CSRF korumasına gerek yok.
            .csrf(AbstractHttpConfigurer::disable)

            // ---------------------------------------------------------------
            // 3. SESSION YÖNETİMİ: Stateless
            // ---------------------------------------------------------------
            // Sunucu tarafında hiç session oluşturulmaz.
            // Her istekte JWT token taşınır; durum (state) client'ta saklanır.
            // Bu yaklaşım yatay ölçeklenmeyi (horizontal scaling) kolaylaştırır.
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // ---------------------------------------------------------------
            // 4. YETKİLENDİRME KURALLARI (Authorization Rules)
            // ---------------------------------------------------------------
            .authorizeHttpRequests(auth -> auth

                // ---- PUBLIC ENDPOİNT'LER (Giriş gerekmez) ----

                // Ürün okuma işlemleri: Vitrin herkese açıktır.
                // GET /api/v1/products, /api/v1/products/{slug} vb.
                .requestMatchers(HttpMethod.GET,  "/api/v1/products/**").permitAll()

                // Ürün filtreleme (POST body ile): Yine herkese açık.
                .requestMatchers(HttpMethod.POST, "/api/v1/products/filter").permitAll()

                // JSONB attribute filtresi (GET + query param): Herkese açık.
                .requestMatchers(HttpMethod.GET,  "/api/v1/products/attributes").permitAll()

                // Clerk webhook endpoint'i: Clerk'ten gelir, JWT olmaz.
                // Güvenlik katmanı: Svix imza doğrulaması (UserController'da)
                .requestMatchers(HttpMethod.POST, "/api/v1/webhooks/**").permitAll()

                // ---- KORUNAN ENDPOİNT'LER (JWT token zorunlu) ----

                // Kullanıcı profili: Yalnızca giriş yapmış kullanıcılar erişebilir.
                .requestMatchers("/api/v1/users/**").authenticated()

                // Diğer tüm istekler de kimlik doğrulama gerektirsin.
                // Bu kural, gelecekte eklenecek korumalı endpoint'leri
                // otomatik olarak kapsar (güvenli varsayılan).
                .anyRequest().authenticated()
            )

            // ---------------------------------------------------------------
            // 5. OAuth2 RESOURCE SERVER: Clerk JWT Doğrulaması
            // ---------------------------------------------------------------
            // Spring Security, gelen "Authorization: Bearer <token>" başlığındaki
            // JWT'yi Clerk'in JWKS endpoint'inden aldığı public key ile doğrular.
            //
            // application.properties'deki ayarlar:
            //   spring.security.oauth2.resourceserver.jwt.jwk-set-uri  → public key kaynağı
            //   spring.security.oauth2.resourceserver.jwt.issuer-uri   → token kaynağı doğrulaması
            //
            // jwtAuthenticationConverter(): Clerk'e özgü claim'leri parse etmek için
            // özelleştirilmiş converter (aşağıda tanımlı).
            .oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwt ->
                    jwt.jwtAuthenticationConverter(clerkJwtAuthenticationConverter())
                )
            );

        log.info("[SecurityConfig] Güvenlik filtre zinciri yapılandırıldı.");
        return http.build();
    }

    /**
     * CORS Konfigürasyonu.
     *
     * Hangi origin'lerin, HTTP metodlarının ve başlıkların izin verileceğini tanımlar.
     *
     * CORS nedir?
     * Tarayıcı, farklı bir origin'den (protokol + domain + port) API çağrısı yapılınca
     * önce bir "preflight" OPTIONS isteği gönderir. Sunucu izin verirse gerçek istek gider.
     *
     * allowedOrigins: application.properties'den gelir (virgülle ayrılmış liste).
     * Örn: "http://localhost:3000,https://techstore.com"
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // İzin verilen origin'ler (Next.js geliştirme + production domain)
        // "," ile ayrılmış string'i listeye dönüştür
        List<String> origins = List.of(allowedOrigins.split(","));
        config.setAllowedOrigins(origins);

        // İzin verilen HTTP metodları
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // İzin verilen başlıklar
        // Authorization: JWT token taşır
        // Content-Type: JSON body için zorunlu
        // X-Requested-With, X-Clerk-User-Id: Özel başlıklar
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "X-Clerk-User-Id",
                "svix-id",         // Clerk webhook imza başlıkları
                "svix-timestamp",
                "svix-signature"
        ));

        // Kimlik bilgilerini (cookie, Authorization header) cross-origin isteklerde izin ver
        config.setAllowCredentials(true);

        // Preflight (OPTIONS) isteğinin cache süresi (saniye)
        // 3600 saniye = 1 saat; bu süre boyunca tarayıcı preflight tekrar atmaz
        config.setMaxAge(3600L);

        // Bu konfigürasyonu tüm path'lere uygula
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        log.info("[SecurityConfig] CORS yapılandırıldı. İzin verilen origin'ler: {}", origins);
        return source;
    }

    /**
     * Clerk JWT Authentication Converter.
     *
     * Clerk'in JWT token'larında standart "roles" veya "scope" claim'leri
     * yerine özel claim'ler bulunabilir. Bu converter:
     *   1. JWT'den yetki (authority) bilgisini doğru şekilde çıkarır.
     *   2. Claim prefix'ini temizler (varsayılan "SCOPE_" prefix'i kaldırılır).
     *
     * Clerk JWT payload örneği:
     *   {
     *     "sub": "user_2abc...",    → Spring Security principal (kullanıcı ID)
     *     "iss": "https://clerk..", → token kaynağı (doğrulanır)
     *     "exp": 1750000000,        → son geçerlilik süresi
     *     "azp": "clerk_frontend_api_key"
     *   }
     *
     * Şu an için bu proje sadece son kullanıcılara açık (rol yönetimi yok).
     * Bu converter basit tutulmuştur; gelecekte rol bazlı yetkilendirme
     * eklenirse "authorities" claim'i parse edilebilir.
     */
    @Bean
    public JwtAuthenticationConverter clerkJwtAuthenticationConverter() {
        // Yetki çıkarıcı: JWT'den hangi claim'i okuyacağını belirler
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();

        // Clerk JWT'lerde "scope" yerine boş ya da özel claim bulunabilir.
        // Claim adını "roles" olarak ayarla (Clerk metadatasında yoksa boş kalır).
        authoritiesConverter.setAuthoritiesClaimName("roles");

        // Yetki prefix'ini kaldır: "SCOPE_read" yerine sadece "read" olsun
        authoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);

        return converter;
    }
}
