import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serve o site em https://<usuario>.github.io/dash.ai/
  base: '/dash.ai/',
  server: {
    port: 3000,
  },
})
