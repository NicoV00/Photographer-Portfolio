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
      // Eliminar clientPort o configurarlo para que coincida con el puerto del servidor
      protocol: 'ws', // Usar protocolo WebSocket no seguro en vez de wss
      host: 'localhost', // Especificar el host explícitamente
      port: 3001 // Usar el mismo puerto que el servidor
    }
  }
})
