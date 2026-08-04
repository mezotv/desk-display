import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/bridge/agent-usage-bridge.ts",
      fileName: () => "desk-display-agent-bridge.mjs",
      formats: ["es"],
    },
    outDir: ".output/agent-bridge",
    rollupOptions: {
      output: {
        codeSplitting: false,
        entryFileNames: "desk-display-agent-bridge.mjs",
      },
    },
    ssr: true,
    target: "node22",
  },
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    noExternal: true,
  },
});
