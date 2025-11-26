import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Lấy port từ environment hoặc command line
  const port = Number(process.env.VITE_PORT) || 5173

  return {
    plugins: [react()],
    server: {
      port,
      strictPort: false,
      // Tránh lock conflicts khi chạy nhiều instances
      watch: {
        usePolling: false,
      },
      fs: {
        strict: false,
      },
    },
    // Sử dụng cache riêng cho mỗi port để tránh conflict
    cacheDir: `.vite-cache-${port}`,
  }
})
