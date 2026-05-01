import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/albumCovers/',
  plugins: [react()],
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    proxy: {
      '/api/musicbrainz': {
        target: 'https://musicbrainz.org/ws/2',
        changeOrigin: true,
        secure: false,
        timeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/api/discogs': {
        target: 'https://api.discogs.com',
        changeOrigin: true,
        secure: false,
        timeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Discogs proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Discogs Request:', req.method, req.url);
            // Add User-Agent header for Discogs
            proxyReq.setHeader('User-Agent', 'AlbumCoversExplorer/1.0.0');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Discogs Response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});
