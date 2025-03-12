import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Allows access from any network (0.0.0.0)
    port: 3001,
    strictPort: true,
    cors: true,  // Allow cross-origin requests
    hmr: {
      clientPort: 443, // Required for ngrok HTTPS tunnels
    }
  }
})
