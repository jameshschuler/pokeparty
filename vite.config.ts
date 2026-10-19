import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import { validateSiteUrl } from "./src/lib/site-url.ts";

export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    validateSiteUrl(loadEnv(mode, process.cwd(), "VITE_").VITE_SITE_URL);
  }
  return {
    plugins: [
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      react(),
      tailwindcss(),
    ],
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
    },
  };
});
