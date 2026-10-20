import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // true = escuta em 0.0.0.0 e mostra o IP da rede (acesso pelo celular no mesmo Wi‑Fi)
    host: true,
  },
  // sockjs-client (usado pelo chat em tempo real) foi escrito pra Node.js e
  // espera a variável global "global" existir, que não existe no navegador.
  define: {
    global: "globalThis",
  },
});
