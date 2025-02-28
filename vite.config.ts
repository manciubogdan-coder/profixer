
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
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    modulePreload: false,  // Dezactivare module preload
    cssCodeSplit: false,   // Un singur fișier CSS
    rollupOptions: {
      output: {
        format: 'umd',
        entryFileNames: 'app.[hash].js',
        chunkFileNames: 'chunk-[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        inlineDynamicImports: true, // Incluziune totală
        manualChunks: undefined     // Fără chunking manual
      },
    },
  }
}));
