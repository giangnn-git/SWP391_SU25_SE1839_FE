import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://junie-preaortic-sina.ngrok-free.dev",
        changeOrigin: true,
        secure: false, // bỏ check SSL self-signed
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
