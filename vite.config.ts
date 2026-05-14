import { defineConfig } from 'vite';
import { fileManagerApiPlugin } from './fileManagerApiPlugin';
import path from 'path';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    fileManagerApiPlugin(),
  ],
  server: {
    watch: { usePolling: true, interval: 800 /* 300~1500 */ },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
