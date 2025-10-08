import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
<<<<<<< HEAD
        // target: "https://orthopterous-unwieldable-kristal.ngrok-free.dev",
        target: "https://junie-preaortic-sina.ngrok-free.dev",
=======
        // target: "https://orthopterous-unwieldable-kristal.ngrok-free.dev", // tam
        target: "https://junie-preaortic-sina.ngrok-free.dev/admin/user", // QA
>>>>>>> origin/dev
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
