import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'node:path';
import react from '@vitejs/plugin-react-swc';

const timelineEditorSrc = path.resolve(
    __dirname,
    'node_modules/@xzdarcy/react-timeline-editor/src/index.tsx',
);

// Library build — run with: vite build --config vite.lib.config.ts
export default defineConfig({
    plugins: [
        react(),
        dts({
            tsconfigPath: './tsconfig.app.json',
            include: ['src'],
            exclude: [
                'src/main.tsx',
                'src/App.tsx',
                'src/App.css',
                'src/pages/**',
                'src/lib.css',
                'src/components/ui/drawer.tsx',
            ],
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
                replacement: path.resolve(
                    __dirname,
                    'node_modules/@xzdarcy/react-timeline-editor/dist/react-timeline-editor.css',
                ),
            },
            // Prebuilt dist/index.es.js ships its own React binding — compile from source instead.
            {
                find: '@xzdarcy/react-timeline-editor',
                replacement: timelineEditorSrc,
            },
        ],
        dedupe: ['react', 'react-dom'],
    },
});
