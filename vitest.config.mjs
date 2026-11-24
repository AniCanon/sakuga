import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { coreEntry } from './vite.config.mjs';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: coreEntry },
  test: { environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'] },
});
