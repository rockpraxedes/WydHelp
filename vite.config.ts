// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname( fileURLToPath( import.meta.url ) )

export default defineConfig( {
  plugins: [ react() ],

  resolve: {
    alias: {
      '@': path.resolve( __dirname, './src' ),
    },
  },

  server: {
    proxy: {
      // Redireciona /api/royal-arena → Lambda URL (só no npm run dev)
      '/api/royal-arena': {
        target: 'https://rn3xfhamppsetddkod6vwc24lu0lhcek.lambda-url.us-east-1.on.aws',
        changeOrigin: true,
        rewrite: ( p ) => p.replace( /^\/api\/royal-arena/, '/royal-arena' ),
      },
    },
  },
} )