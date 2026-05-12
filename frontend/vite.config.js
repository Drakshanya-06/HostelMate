import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {

        build: {
            outDir: 'dist',
            emptyOutDir: true,
        },
        server: {
            port: 5000,
            strictPort: true,
            host: '0.0.0.0',
            proxy: {
                '/api': {
                    target: 'http://localhost:5001',
                    changeOrigin: true,
                }
            },
            fs: {
                // Allow serving files from one level up to the project root
                allow: ['..']
            }
        },
        plugins: [react()],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            }
        }
    };
});
