import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Empty prefix so PUBLIC_BASE is readable here alongside the VITE_ variables.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Asset URLs are absolute from here. Only needs changing if the gateway mounts the UI
    // somewhere other than the root, e.g. PUBLIC_BASE=/chat/ when it serves it at /chat.
    base: env.PUBLIC_BASE ?? '/',
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        // Stands in for the gateway during development. Nothing reads this in production.
        '/api': {
          target: env.VITE_API_TARGET ?? 'http://localhost:8000',
          // A remote target routes on the Host header, so it has to be rewritten to the
          // target's own. Tunnels and ingresses 404 without this; localhost doesn't care.
          changeOrigin: true,
          headers: { 'ngrok-skip-browser-warning': 'true' },
        },
      },
    },
  };
});
