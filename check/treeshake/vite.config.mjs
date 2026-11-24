import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: new URL('.', import.meta.url).pathname,
  plugins: [react()],
  logLevel: 'warn',
  build: { outDir: 'out', emptyOutDir: true, minify: false, assetsInlineLimit: 0 },
});
