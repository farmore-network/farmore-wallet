import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Minimal, clean build. No bundle-time secrets; runtime config comes from VITE_* env
// (resolver URL) with safe defaults, and contract addresses from @farmore-network/contracts.
//
// Dev proxy: the browser calls the same-origin path "/__resolver/*", which Vite forwards to
// the real resolver server-side. This sidesteps the browser's cross-origin (CORS) block so
// the wallet works locally without changing the resolver. Override the target with
// VITE_RESOLVER_TARGET if testing against a different resolver.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".");
  const target = env.VITE_RESOLVER_TARGET || "http://84.8.134.52:8080";
  return {
    plugins: [react()],
    build: { target: "es2022", sourcemap: true },
    server: {
      port: 5173,
      proxy: {
        "/__resolver": {
          target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__resolver/, ""),
        },
      },
    },
  };
});
