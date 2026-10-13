import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// BASE PATH FOR GITHUB PAGES
// The app uses hash-based URLs (e.g. /#/diary), so a relative base ('./')
// works no matter what your repository is called. You normally do NOT need
// to change this. If you ever want an absolute base, set the environment
// variable VITE_BASE, e.g. VITE_BASE=/nutrisnap-ai/ (with both slashes).
const base = process.env.VITE_BASE || './';

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
