import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      outDir: "dist",
      chunkSizeWarningLimit: 1200,
      minify: "esbuild",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@clerk') || id.includes('clerk')) {
                return 'clerk-auth';
              }
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'pdf-generator';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'charts-visualizer';
              }
              if (id.includes('@google/genai')) {
                return 'gemini-sdk';
              }
              return 'vendor-bundle';
            }
          },
        },
      },
    },
  };
});
