// // vite.config.js
// import { defineConfig, loadEnv } from 'vite';
// import react from '@vitejs/plugin-react';
// import { VitePWA } from "vite-plugin-pwa";

// // 터널 도메인을 환경변수로 넣어두면 매번 하드코딩 안 해도 됩니다.
// const TUNNEL_HOST =
//   process.env.CF_TUNNEL_HOST ||
//   "howard-flights-ict-antarctica.trycloudflare.com";

// export default defineConfig(({ mode }) => {
//   // 현재 작업 디렉토리의 .env 파일을 로드합니다.
//   const env = loadEnv(mode, process.cwd(), '');

//   return {
//     plugins: [
//       react(),
//       VitePWA({
//         registerType: "autoUpdate",
//         devOptions: { enabled: true },
//         workbox: { globPatterns: ["**/*.{js,css,html,ico,png,svg}"] },
//         includeAssets: ["image/*.png"],
//         manifest: {
//           name: "테스트용 리액트앱",
//           short_name: "MyApp",
//           description: "설명",
//           theme_color: "#000000",
//           background_color: "#000000",
//           display: "standalone",
//           start_url: ".",
//           scope: ".",
//         },
//       }),
//     ],
//     server: {
//       host: true,
//       allowedHosts: [TUNNEL_HOST],
//       hmr: {
//         host: TUNNEL_HOST,
//         protocol: "wss",
//         clientPort: 443,
//       },
//       // ✨ [수정] 프록시 설정을 추가하여 CORS 문제를 해결합니다.
//       proxy: {
//         // '/api'로 시작하는 요청을 네이버 API 서버로 전달합니다.
//         '/api': {
//           target: 'https://naveropenapi.apigw.ntruss.com',
//           changeOrigin: true, // cross-origin 요청을 위해 필수로 추가
//           rewrite: (path) => path.replace(/^\/api/, ''), // 요청 경로에서 '/api'를 제거
//           // 프록시 요청 헤더에 인증 정보를 추가합니다.
//           configure: (proxy, options) => {
//             proxy.on('proxyReq', (proxyReq, req, res) => {
//               proxyReq.setHeader('X-NCP-APIGW-API-KEY-ID', env.VITE_NAVER_MAPS_CLIENT_ID);
//               proxyReq.setHeader('X-NCP-APIGW-API-KEY', env.VITE_NAVER_MAPS_SECRET_KEY);
//             });
//           },
//         },
//       },
//     },
//   };
// });

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const TUNNEL_HOST =
  process.env.CF_TUNNEL_HOST || "ja-journalism-trailers-glen.trycloudflare.com";

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), ""); // 프론트 번들에 노출될 값은 VITE_ 접두사만

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: { enabled: true },
        workbox: { globPatterns: ["**/*.{js,css,html,ico,png,svg}"] },
        includeAssets: ["image/*.png"],
        manifest: {
          name: "마인드맵 프로젝트",
          short_name: "마인드맵",
          description: "위치 기반 마인드맵 서비스",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: [
            {
              src: "/check.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/photoshoot.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
    server: {
      host: true,
      allowedHosts: [TUNNEL_HOST],
      hmr: { host: TUNNEL_HOST, protocol: "wss", clientPort: 443 },

      // ✅ 프런트의 /api → 로컬 Express 서버로 전달
      proxy: {
        "/api": {
          target: "http://localhost:4000", // ★ 네이버 아님
          changeOrigin: true,
        },
      },
    },
  };
});
