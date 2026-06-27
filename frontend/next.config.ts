import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Uzak görsel kaynakları — Next.js Image bileşeni yalnızca
     * burada tanımlı domain'lerden gelen görselleri optimize eder.
     *
     * localhost:8080 → Spring Boot'tan dönen lokal görsel path'leri
     * img.clerk.com  → Clerk kullanıcı profil fotoğrafları
     * images.unsplash.com → Geliştirme döneminde placeholder görseller
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
