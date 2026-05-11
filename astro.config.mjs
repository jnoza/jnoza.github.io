import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 4321;
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

export default defineConfig({
  output: "static",
  server: {
    host: "0.0.0.0",
    port,
    allowedHosts: true,
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
    },
    preview: {
      host: "0.0.0.0",
      allowedHosts: true,
    },
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark-dimmed",
      wrap: true,
    },
  },
});
