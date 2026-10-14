import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const sentimentApiUrl = env.VITE_SENTIMENT_API_URL || "https://deep-learning-sentiment-production.up.railway.app";

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api-sentiment": {
          target: sentimentApiUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-sentiment/, ""),
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
    build: {
      target: "es2020",
      cssCodeSplit: true,
      minify: "esbuild",
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("/react/")) {
                return "vendor-react";
              }
              if (id.includes("recharts") || id.includes("d3-") || id.includes("victory-vendor")) {
                return "vendor-charts";
              }
              if (id.includes("@supabase")) {
                return "vendor-supabase";
              }
              if (id.includes("@tanstack")) {
                return "vendor-query";
              }
              if (id.includes("date-fns")) {
                return "vendor-date";
              }
              if (id.includes("lucide-react")) {
                return "vendor-icons";
              }
            }
          },
        },
      },
    },
  };
});
