import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // sockjs-client (usado pelo chat em tempo real) foi escrito pra Node.js e
  // espera a variável global "global" existir, que não existe no navegador.
  define: {
    global: "globalThis",
  },
});
