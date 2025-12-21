import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // 개발 서버 설정(CORS 통과를 위해)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8070',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') /* ^/api/ */
      }
    }
  }
})
