import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { createHtmlPlugin } from 'vite-plugin-html';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        terms: resolve(__dirname, 'src/terms.html')
      }
    }
  },
  plugins: [
    legacy(),
    createHtmlPlugin({
      inject: {
        data: {
          htmlComponents: {
            header: '/html/components/header.html',
            filters: '/html/components/filters.html',
            sidebar: '/html/components/sidebar.html',
            map: '/html/components/map.html',
            mobile: '/html/components/mobile.html',
            modal: '/html/components/modal.html'
          }
        }
      }
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'sw.js',
          dest: ''
        }
      ]
    })
  ]
});
