
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Generează bundle-uri ES5 mai compatibile
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    // Evită utilizarea modulelor ES în build-ul de producție
    rollupOptions: {
      output: {
        format: 'iife'
      }
    },
  }
}));
