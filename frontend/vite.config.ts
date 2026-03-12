import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // <-- 1. Import the new Tailwind v4 plugin

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: false, // 🔥 disable broken Fast Refresh (CORRECT WAY)
    },
    plugins: [
      react(),
      tailwindcss(), // <-- 2. Add it to the plugins array
    ],
    // 3. Removed the Gemini API Key injection since your Render/HF backend handles ML now!
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});