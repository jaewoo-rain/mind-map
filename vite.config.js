// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
});

// import { defineConfig, loadEnv } from "vite";
// import react from "@vitejs/plugin-react";
// import { VitePWA } from "vite-plugin-pwa";

// const TUNNEL_HOST =
//   process.env.CF_TUNNEL_HOST || "duty-serum-java-iii.trycloudflare.com";

// export default defineConfig(({ mode }) => {
//   loadEnv(mode, process.cwd(), ""); // 프론트 번들에 노출될 값은 VITE_ 접두사만

//   return {
//     plugins: [
//       react(),
//       VitePWA({
//         registerType: "autoUpdate",
//         devOptions: { enabled: true },
//         workbox: { globPatterns: ["**/*.{js,css,html,ico,png,svg}"] },
//         includeAssets: ["image/*.png"],
//         manifest: {
//           name: "재주꾼들의 프로젝트",
//           short_name: "제주런",
//           description: "런트리퍼를 위한 서비스",
//           theme_color: "#ffffff",
//           background_color: "#ffffff",
//           display: "standalone",
//           start_url: "/",
//           scope: "/",
//           icons: [
//             {
//               src: "/logo1.png",
//               sizes: "192x192",
//               type: "image/png",
//             },
//             {
//               src: "/logo2.png",
//               sizes: "512x512",
//               type: "image/png",
//             },
//           ],
//         },
//       }),
//     ],
//     server: {
//       host: true,
//       allowedHosts: [TUNNEL_HOST],
//       hmr: { host: TUNNEL_HOST, protocol: "wss", clientPort: 443 },

//       // ✅ 프런트의 /api → 로컬 Express 서버로 전달
//       proxy: {
//         "/api": {
//           target: "http://172.17.128.1:4000", // ★ 네이버 아님
//           changeOrigin: true,
//         },
//       },
//     },
//   };
// });
