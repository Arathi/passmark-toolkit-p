import { resolve } from "node:path";
import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 9379
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    preact(),
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        name: "PassMark Toolkit P",
        icon: "https://www.cpubenchmark.net/img/chartssb.svg",
        namespace: "com.undsf.pmtk",
        match: [
          "https://www.cpubenchmark.net/*",
          "https://www.videocardbenchmark.net/*",
        ],
      },
      build: {
        externalGlobals: {
          preact: cdn.jsdelivr('preact', 'dist/preact.min.js'),
        },
      },
    }),
  ],
});
