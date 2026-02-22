import { defineConfig } from "vite";

export default defineConfig({
  root: "src/frontend",
  publicDir: "assets",
  build: {
    outDir: "../../dist/public",
    emptyOutDir: true,
  },
});
