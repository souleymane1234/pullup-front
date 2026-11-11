import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const isVitest = process.env.VITEST === 'true';
const isStorybook = process.argv.some((arg) => arg.includes('storybook'));

export default defineConfig({
  plugins: [
    react(),
    !isVitest && !isStorybook && VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'PULLUP',
        short_name: 'PULLUP',
        description: "Marketing d'influence en Côte d'Ivoire",
        lang: 'fr',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#F4F3F8',
        theme_color: '#2A4BA0',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: { '@': path.resolve(root, 'src') },
  },
  server: {
    port: 6010,
    strictPort: true,
    // Chrome bloque le port 6000 (X11). Le navigateur parle à 6010, Vite relaie vers l'API.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:6000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) return 'react';
          if (id.includes('@tanstack/react-query')) return 'query';
          if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    css: false,
    env: {
      VITE_API_URL: 'http://localhost:3000/api',
    },
  },
});
