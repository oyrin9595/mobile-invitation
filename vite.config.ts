import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  /** 로컬 `npm run dev` 는 루트(`/`) 기준. GitHub Pages용 빌드는 `npm run build:gh` */
  base: "/",
});
