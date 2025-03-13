import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { createHtmlPlugin } from 'vite-plugin-html';
import { resolve } from 'path'; // Добавляем для абсолютных путей

export default defineConfig({
  root: 'src', // Исходники в src/
  publicDir: '../public', // Статические файлы из public/
  build: {
    outDir: '../dist', // Результат сборки в dist/
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'), // Абсолютный путь к index.html
        terms: resolve(__dirname, 'src/terms.html') // Абсолютный путь к terms.html
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
      // Убираем entry, так как используем rollupOptions.input
    })
  ]
});
