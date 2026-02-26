import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'

function pathResolve(dir) {
  return resolve(__dirname, '.', dir)
}

export default defineConfig({
  plugins: [
    vue({
      compilerOptions: {
        preserveWhitespace: true
      }
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
    legalComments: 'none',
    loader: '.js',
    include: /src\/.*\.js$/,
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
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: false,
    sourcemap: false,
    rollupOptions: {
      onwarn(warning, warn) {
        // 忽略特定警告
        if (warning.code === 'THIS_IS_UNDEFINED') return
        if (warning.code === 'CIRCULAR_DEPENDENCY') return
        warn(warning)
      }
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    open: false,
  },
})
