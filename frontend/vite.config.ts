import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          chat: ['./src/pages/ChatConsole.tsx'],
        },
      },
    },
  },
  // @ts-ignore - test config is valid but TypeScript doesn't recognize it in build mode
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    exclude: ['**/node_modules/**', '**/tests/e2e/**'],
  },
});
