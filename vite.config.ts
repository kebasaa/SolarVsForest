import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// GitHub Pages serves the site from /<repo-name>/
export default defineConfig({
  base: process.env.BASE_PATH ?? '/SolarVsForest/',
  plugins: [svelte()],
  build: { target: 'es2022', cssMinify: true },
  test: { include: ['src/**/*.test.ts'] }
});
