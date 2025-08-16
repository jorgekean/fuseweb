import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically update the service worker when a new version is available
      manifest: {
        name: 'Fuse Web App',
        short_name: 'FuseWeb',
        description: 'Time tracking and automatic oracle upload.',
        theme_color: '#F2F3F4',// graymatter-50
        icons: [
          {
            src: '/Purple200.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/Purple500.png',
            sizes: '512x512',
            type: 'image/png',
          },
          // You can add more icons or different sizes as needed.
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4000000, // 4MB
      },
      // Optionally, configure caching strategies and other service worker options here.
    }),
  ],
  server: {
    open: true,
  },
});
