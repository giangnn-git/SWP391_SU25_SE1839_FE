import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        // target: "https://orthopterous-unwieldable-kristal.ngrok-free.dev", // tam
        // target: "https://junie-preaortic-sina.ngrok-free.dev", // QA
        target: "https://swp391su25se1839fe-production.up.railway.app",

        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
