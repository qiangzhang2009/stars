import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import viteCompression from 'vite-plugin-compression'

function pathResolve(dir) {
  return resolve(__dirname, '.', dir)
}

export default defineConfig({
  plugins: [
    vue({
      compilerOptions: {
        // 完全禁用错误处理
        errorHandler: false,
        warnHandler: false
      }
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 1024 * 10,
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  resolve: {
    alias: {
      '/@': pathResolve('src'),
    },
  },
  esbuild: {
    // 禁用所有警告和错误
    log: false,
    legalComments: 'none'
  },
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    include: ['axios'],
  },
  base: './',
  build: {
    publicDir: 'public',
    target: 'modules',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        assetFileNames: 'static/[ext]/[name].[hash].[ext]',
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vandor'
          }
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 10000,
    cors: true,
    open: false,
    allowedHosts: true,
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
