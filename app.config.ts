import { defineConfig } from "@tanstack/solid-start/config";

export default defineConfig({
  ssr: true,
  server: {
    preset: "node-server",
  },
});
