import { defineConfig } from 'vite';
import { fileManagerApiPlugin } from './fileManagerApiPlugin';
import path from 'path';
import react from '@vitejs/plugin-react-swc';

const timelinePkgRoot = path.resolve(__dirname, 'node_modules/@xzdarcy/react-timeline-editor');

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    fileManagerApiPlugin(),
  ],
  server: {
    // Native file watching is much lighter on CPU than polling; enable polling only if HMR misses changes (e.g. Docker).
    watch: process.env.VITE_USE_POLLING === '1'
      ? { usePolling: true, interval: 1000 }
      : undefined,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      {
        find: '@xzdarcy/react-timeline-editor/dist/react-timeline-editor.css',
        replacement: path.join(timelinePkgRoot, 'dist/react-timeline-editor.css'),
      },
      {
        find: '@xzdarcy/react-timeline-editor',
        replacement: path.join(timelinePkgRoot, 'src/index.tsx'),
      },
    ],
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    dedupe: ['react', 'react-dom'],
    // Never pre-bundle dist/index.es.js (invalid hook call with duplicate React).
    exclude: ['@xzdarcy/react-timeline-editor'],
    // interactjs is CJS-only; excluded timeline editor is its only importer — must pre-bundle explicitly.
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-virtualized',
      'interactjs',
    ],
  },
}));
