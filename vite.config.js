import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { createHtmlPlugin } from 'vite-plugin-html'; // Изменяем импорт

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  plugins: [
    legacy(), // Для поддержки старых браузеров, если нужно
    createHtmlPlugin({ // Используем createHtmlPlugin
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
    })
  ]
});
