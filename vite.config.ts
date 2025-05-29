import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 三大核心库拆包
          if (id.includes('node_modules')) {
            if (id.includes('dayjs'))
              return 'dayjs'
            if (id.includes('echarts'))
              return 'echarts'
            if (id.includes('zustand'))
              return 'zustand'
            if (id.includes('axios'))
              return 'axios'
            if (id.includes('@react-pdf'))
              return 'pdf'
            if (id.includes('qiniu-js'))
              return 'qiniu'
            if (id.includes('localforage'))
              return 'local-storage'
            if (id.includes('lucide-react'))
              return 'icons'
            return 'vendor'
          }
        },
      },
    },
  },
})
