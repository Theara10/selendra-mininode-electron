import { join } from "path";
import { builtinModules } from "module";
import { defineConfig } from "vite";
import pkg from "../package.json";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  mode: process.env.NODE_ENV,
  root: join(__dirname, "../src/main"),
  build: {
    outDir: "../../dist/main",
    lib: {
      entry: "index.js",
      formats: ["cjs"],
    },
    minify: process.env.NODE_ENV === "production",
    emptyOutDir: true,
    rollupOptions: {
      external: [
        "electron",
        ...builtinModules,
        ...Object.keys(pkg.dependencies || {}),
      ],
      output: {
        entryFileNames: "[name].cjs",
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "../../src/main/child.js",
          dest: "../../dist/main",
        },
      ],
    }),
  ],
});
