import path from 'node:path'
import {defineConfig} from 'tsdown'

const ROOT = path.dirname(new URL(import.meta.url).pathname)
const WORKSPACE_ROOT = path.join(ROOT, '..')

export default defineConfig({
  entry: [path.join(ROOT, 'src/index.ts')],
  format: ['esm'],
  platform: 'browser',
  target: 'es2022',
  sourcemap: true,
  minify: true,
  clean: true,
  outDir: path.join(ROOT, 'dist'),
  dts: true,
  copy: [
    path.join(ROOT, 'src/fonts'),
    path.join(WORKSPACE_ROOT, 'node_modules', 'leaflet', 'dist', 'images'),
  ],
  deps: {
    neverBundle: ['react', 'react-dom'],
    alwaysBundle: ['merge-images'],
    onlyBundle: false,
  },
  css: {
    transformer: 'postcss',
    modules: false,
    preprocessorOptions: {
      scss: {},
    },
  },
})
