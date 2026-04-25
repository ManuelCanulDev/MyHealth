import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // MYHEALTH_* disponible en dev sin prefijo VITE_ (útil si Coolify usa MYHEALTH_API_URL).
  envPrefix: ['VITE_', 'MYHEALTH_'],
})
