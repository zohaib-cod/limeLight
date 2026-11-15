import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const BACKEND_URL = env.VITE_API_URL || 'https://lime-light-b.vercel.app';

  return {
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
  };
});
