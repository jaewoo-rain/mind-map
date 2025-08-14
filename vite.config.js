// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// 터널 도메인을 환경변수로 넣어두면 매번 하드코딩 안 해도 됩니다.
const TUNNEL_HOST =
  process.env.CF_TUNNEL_HOST || "cloth-resulting-ontario-cs.trycloudflare.com";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true }, // dev에서도 SW 테스트
      workbox: { globPatterns: ["**/*.{js,css,html,ico,png,svg}"] },
      includeAssets: ["image/*.png"], // /public/image/*.png
      manifest: {
        name: "테스트용 리액트앱",
        short_name: "MyApp",
        description: "설명",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        start_url: ".", // PWA 루트 경로
        scope: ".",
        icons: [
          { src: "logo-192.png", sizes: "192x192", type: "image/png" },
          { src: "logo-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  server: {
    host: true, // 0.0.0.0 바인딩
    allowedHosts: [
      TUNNEL_HOST,
      // 필요시 아래처럼 전체 허용 가능(보안상 권장X)
      // ".trycloudflare.com"
    ],
    // HTTPS 터널 뒤에서 HMR이 안 잡힐 때
    hmr: {
      host: TUNNEL_HOST,
      protocol: "wss",
      clientPort: 443,
    },
  },
});
