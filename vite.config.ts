import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    host: true, // ローカルネットワークアクセスを許可
    port: 5173, // 必要ならポート番号を変更
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      disable: process.env.NODE_ENV === 'development',
      manifest: {
        name: 'Todo',
        short_name: 'Todo',
        description: 'やることをTodoで管理',
        start_url: '.',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#0000',
        background_color: '#0000',
        icons: [
          {
            src: "/icons/192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icons/512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: 'maskable'
          }
        ]
      }
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
