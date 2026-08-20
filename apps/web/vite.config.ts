import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

const tauriDevHost = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg'],
      manifest: {
        id: '/',
        name: 'ThermoShift',
        short_name: 'ThermoShift',
        description: 'Fast, precise, private temperature conversion for modern devices.',
        theme_color: '#111827',
        background_color: '#f8fafc',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        start_url: '/',
        scope: '/',
        lang: 'en',
        dir: 'ltr',
        orientation: 'any',
        categories: ['education', 'productivity', 'utilities'],
        icons: [
          { src: '/logo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,wasm}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
    host: tauriDevHost || false,
    hmr: tauriDevHost
      ? {
          protocol: 'ws',
          host: tauriDevHost,
          port: 5174,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 650,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      thresholds: {
        lines: 75,
        functions: 70,
        branches: 65,
        statements: 75,
      },
    },
  },
});
