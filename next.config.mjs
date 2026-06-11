/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lint roda em dev (`npm run lint`); não bloqueia o build de produção.
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // Uploads via Server Actions (vídeo da splash, mídias). Default é 1MB.
    serverActions: { bodySizeLimit: "70mb" },
  },
  images: {
    // Serve AVIF/WebP automaticamente (next/image).
    formats: ["image/avif", "image/webp"],
    // MinIO em dev. Em produção, ajustar para o domínio público de mídia.
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "9000", pathname: "/**" },
      { protocol: "https", hostname: "midia-benx.imagenou.com", pathname: "/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      {
        // Parque Global tem site próprio: o item do menu redireciona para lá.
        source: "/parque-global",
        destination: "https://parqueglobal.com.br/",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        // Assets estáticos versionados podem ser cacheados agressivamente.
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff2|mp4)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
