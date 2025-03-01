
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
    react({
      // Optimize React runtime
      jsxImportSource: undefined,
      // Fastest possible development mode
      devTarget: 'es2022',
      // Optimize SSR components
      plugins: []
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Extreme optimization for build
  build: {
    target: 'esnext', // Modern browsers only for maximum performance
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    cssCodeSplit: false, // Bundle all CSS together for LCP optimization
    modulePreload: false, // Skip module preload for faster initial load
    reportCompressedSize: false, // Skip compression calculation
    chunkSizeWarningLimit: 1000,
    emptyOutDir: true,
    cssMinify: true,
    terserOptions: {
      ecma: 2020,
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
        passes: 3, // Additional compression passes
        toplevel: true,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_methods: true
      },
      mangle: {
        safari10: false, // Skip Safari 10 support for better minification
        toplevel: true
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
        // Improved code splitting strategy
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide') || id.includes('svg')) {
              return 'vendor-icons';
            }
            return 'vendor';
          }
          if (id.includes('components/ui')) {
            return 'ui';
          }
        },
        // Format for modern browsers
        format: 'es'
      },
    },
  },
  // Pre-bundle dependencies for faster startup
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'lucide-react', 
      'sonner',
      '@radix-ui/react-slot'
    ],
    esbuildOptions: {
      target: 'esnext',
      legalComments: 'none',
      treeShaking: true,
      minify: true,
      minifyWhitespace: true,
      minifyIdentifiers: true,
      minifySyntax: true
    }
  },
  css: {
    devSourcemap: false,
    // Fast CSS processing
    transformer: 'lightningcss',
    // Optimize CSS output
    postcss: {
      plugins: [
        require('autoprefixer')({
          flexbox: 'no-2009',
        }),
        require('cssnano')({
          preset: ['default', {
            discardComments: { removeAll: true },
            minifyFontValues: { removeQuotes: false }
          }]
        })
      ],
    }
  },
  // Enable top-level await when supported
  esbuild: {
    supported: {
      'top-level-await': true
    },
  }
}));
