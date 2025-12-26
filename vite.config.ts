/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "/src/test/setup.ts",
    coverage: {
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/vite.config.ts',
      ],
    },
  },
});
