import { defineConfig } from 'vite'
import viteBaseConfig from './vite.base.config'

// https://vite.dev/config/
export default defineConfig(({ command, mode, isPreview, isSsrBuild }) => {
  console.log('Vite config:', { command, mode, isPreview, isSsrBuild })
  return {
    ...viteBaseConfig,
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
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
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
  }
})
