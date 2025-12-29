import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  
  // Verhindert Redirect-Loop
  trailingSlash: 'ignore',
  
  server: {
    port: 4321,
    host: true
  },
  
  // PERFORMANCE: Dev Toolbar nur in Development
  devToolbar: {
    enabled: false
  },
  
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@core': '/src/core',
        '@morphs': '/src/morphs',
        '@server': '/src/server',
        '@client': '/src/client'
      }
    },
    
    // PERFORMANCE: CSS und JS Bundling optimieren
    build: {
      // CSS in weniger Dateien bundeln
      cssCodeSplit: false,
      // JS besser bundeln
      rollupOptions: {
        output: {
          // Alle JS in ein Bundle
          manualChunks: undefined,
          // Bessere Dateinamen für Caching
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash][extname]'
        }
      },
      // Kleinere Bundles
      minify: 'esbuild',
      // Source Maps nur in Dev
      sourcemap: false
    },
    
    // PERFORMANCE: CSS Optimierung
    css: {
      devSourcemap: false
    }
  },
  
  // PERFORMANCE: Komprimierung aktivieren
  compressHTML: true
});
