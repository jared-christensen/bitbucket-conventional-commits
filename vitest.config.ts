import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: [{ find: /^~(.*)$/, replacement: path.resolve(__dirname, "./src/$1") }],
  },
});
