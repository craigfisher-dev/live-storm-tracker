import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from "@cloudflare/vite-plugin";
import cesium from 'vite-plugin-cesium'

// https://vite.dev/config/
export default defineConfig({
  // @ts-expect-error - vite-plugin-cesium has broken type declarations, works fine at runtime
  plugins: [react(), tailwindcss(), cesium(), cloudflare()],
})