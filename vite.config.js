import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png', 'ringtone.wav', 'sinder.mp3'],
      manifest: {
        name: 'Note Reminder App',
        short_name: 'NoteReminder',
        description: 'A note and reminder tracking app',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: process.env.VITE_BASE_PATH || '/',
        icons: [
          {
            src: 'App_icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'App_icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wav,mp3}']
      }
    })
  ]
})