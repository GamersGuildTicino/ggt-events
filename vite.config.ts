import path from "path";
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/@chakra-ui")) return "chakra-ui";
          if (id.includes("node_modules/@zip.js/zip.js")) return "zip-js";
          if (id.includes("node_modules/zod")) return "zod";
          return null;
        },
      },
      plugins: [
        // visualizer({
        //   brotliSize: true,
        //   gzipSize: true,
        //   open: true,
        // }),
      ],
    },
  },
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
