import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';
import react from '@vitejs/plugin-react-swc';

// Library build — run with: vite build --config vite.lib.config.ts
export default defineConfig({
    plugins: [
        react(),
        dts({
            include: ['src'],
            exclude: [
                'src/main.tsx',
                'src/App.tsx',
                'src/App.css',
                'src/pages/**',
                'src/vite-env.d.ts',
            ],
            rollupTypes: true,
            outDir: 'dist',
            insertTypesEntry: true,
        }),
    ],
    // Don't copy the public/ folder into the library dist
    publicDir: false,
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'ModernSliderPro',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
        },
        rollupOptions: {
            external: [
                'react',
                'react/jsx-runtime',
                'react-dom',
                'framer-motion',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react/jsx-runtime': 'ReactJSXRuntime',
                    'react-dom': 'ReactDOM',
                    'framer-motion': 'FramerMotion',
                },
            },
        },
        cssCodeSplit: false,
        outDir: 'dist',
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
