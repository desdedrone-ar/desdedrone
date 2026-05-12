import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// La app se sirve bajo /app/* (la landing estática vive en /).
// `base` hace que el build emita rutas /app/assets/... en el index.html.
export default defineConfig({
  base: '/app/',
  plugins: [react(), tailwindcss()],
})
