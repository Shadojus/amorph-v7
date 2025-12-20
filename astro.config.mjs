import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  
  server: {
    port: 4323
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
    }
  }
});
