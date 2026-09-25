import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// 本地开发：后端直连 3000（npm run dev）；Docker 内由 nginx 代理到 backend:3000
const apiTarget = process.env.VITE_API_TARGET ?? "http://localhost:3000";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 20104,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true
      }
    }
  }
});
