import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@tensorflow")) {
            return "tensorflow";
          }
          if (id.includes("plotly.js-dist-min")) {
            return "plotly";
          }
        },
      },
    },
  },
});
