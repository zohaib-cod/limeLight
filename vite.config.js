import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'https://lime-light-b.vercel.app';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: true
      },
      '/uploads': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: true
      }
    }
  },
  preview: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: true
      },
      '/uploads': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: true
      }
    }
  }
});
