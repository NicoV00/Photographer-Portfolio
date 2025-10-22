import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    react(),
    // Comprimir archivos con gzip
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // Comprimir archivos mayores a 10kb
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Soporte para navegadores antiguos
    legacy({
      targets: ['defaults', 'not IE 11'],
      modernPolyfills: true,
    })
  ],
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
  },
  build: {
    // Optimizaciones de build
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks para mejor caching
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'gsap-vendor': ['gsap', '@gsap/react'],
          'lenis-vendor': ['lenis', '@studio-freight/lenis'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Aumentar límite de warning para chunks grandes
    cssCodeSplit: true, // Dividir CSS en chunks separados
    sourcemap: false, // Desactivar sourcemaps en producción para reducir tamaño
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@mui/material',
      'gsap',
    ],
  },
})
