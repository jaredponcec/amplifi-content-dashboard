import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api/claude": {
          target: "https://api.anthropic.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/claude/, "/v1/messages"),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              const key = env.VITE_ANTHROPIC_API_KEY;
              if (key) {
                proxyReq.setHeader("x-api-key", key);
                proxyReq.setHeader("anthropic-version", "2023-06-01");
                proxyReq.removeHeader("origin");
                proxyReq.removeHeader("referer");
              }
            });
          },
        },
      },
    },
  };
});
