import { defineConfig } from "@tanstack/start/config";

export default defineConfig({
  ssr: true,
  server: {
    preset: "node-server",
  },
});
