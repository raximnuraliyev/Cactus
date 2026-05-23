import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0', // ALLOWS EXTERNAL DEVICES TO CONNECT
      port: 3001,      // FORCES VITE TO RUN ON PORT 3000
      strictPort: true, 
      allowedHosts: true as any,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        usePolling: true, // FIXES FILE WATCHING/HOT-RELOAD INSIDE DOCKER ON WINDOWS
      },
      proxy: {
        '/api': {
          target: process.env.API_PROXY_TARGET || 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
