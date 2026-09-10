import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Resolves path aliases declared in tsconfig.json.
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
  },
});
