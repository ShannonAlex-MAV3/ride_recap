import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server:{
    // host: '0.0.0.0'
    proxy: {
      '/api': {
        target: 'http://localhost:5000/api', // Your backend server
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
  
})
