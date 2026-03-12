import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // Solo genera el manifest.webmanifest — el SW lo registramos manualmente
    VitePWA({
      registerType: 'prompt',   // no auto-registra; lo hacemos en main.jsx
      injectRegister: false,    // no inyecta registro automático
      strategies: 'generateSW', // no usamos el SW generado
      // Solo el manifest es necesario:
      manifest: {
        name: 'SimLogicFlow',
        short_name: 'SimLogicFlow',
        description: 'Sistema de gestión de simuladores de vuelo',
        theme_color: '#6366f1',
        background_color: '#0f172a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'landscape-primary',
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // SW vacío — usamos /public/sw.js como SW real
        globPatterns: [],
        runtimeCaching: [],
      },
      devOptions: {
        enabled: false, // no interfiere en dev
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
