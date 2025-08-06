import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { version } from './package.json'; // 👈 Import version

// https://vite.dev/config/
export default defineConfig({
  base: '/atc-crisisapp/',
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version), // 👈 Inject as global constant
  },
});
