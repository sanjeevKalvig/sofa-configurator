import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
   server: {
    proxy: {
      '/rest': {
        target: 'http://13.203.184.96',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      '/custom-sofa-json.php': {
        target: 'http://13.203.184.96',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
