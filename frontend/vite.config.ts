import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 20104,
    host: "0.0.0.0",
    proxy: {
      // 本地开发时把 /api 代理到后端；容器内由 nginx.conf 反代到 http://backend:3000/
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
