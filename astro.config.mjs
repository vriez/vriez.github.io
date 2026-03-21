import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://vriez.github.io',
  output: 'static',
  vite: {
    server: {
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**', '**/.continue/**', '**/.agent/**', '**/.agents/**', '**/.claude/**', '**/dist/**'],
      },
    },
  },
});
