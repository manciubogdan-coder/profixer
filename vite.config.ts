
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
    minify: 'terser', // Use terser for better minification
    cssCodeSplit: true,
    modulePreload: { polyfill: true },
    chunkSizeWarningLimit: 500, 
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
        passes: 2 // Additional compression passes
      },
      mangle: {
        safari10: true
      }
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/js/[name].[hash].js',
        chunkFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: 'assets/[ext]/[name].[hash].[ext]',
        // Improved code splitting strategy
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('lucide') || id.includes('svg')) {
              return 'vendor-icons';
            }
            return 'vendor';
          }
          // UI components in a separate chunk
          if (id.includes('components/ui')) {
            return 'ui';
          }
        },
        // Format for modern browsers
        format: 'es'
      },
    },
  },
  // Optimize dependencies 
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'lucide-react', 
      'sonner',
      '@radix-ui/react-slot',
    ],
    esbuildOptions: {
      target: 'es2020',
      legalComments: 'none',
      treeShaking: true,
    }
  },
  // Improve CSS handling
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      // Add any preprocessor options if needed
    }
  }
}));
