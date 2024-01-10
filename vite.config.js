import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), basicSsl(), tsconfigPaths()],
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
