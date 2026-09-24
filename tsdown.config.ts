import {defineConfig} from 'tsdown'

export default defineConfig({
  entry: 'src/index.ts',
  format: ['esm'],
  platform: 'browser',
  target: 'es2022',
  sourcemap: true,
  minify: true,
  clean: true,
  outDir: 'dist',
  dts: true,
  copy: ['src/fonts', 'node_modules/leaflet/dist/images'],
  deps: {
    neverBundle: ['react', 'react-dom'],
    alwaysBundle: ['merge-images'],
    onlyBundle: false,
  },
  css: {
    transformer: 'postcss',
    modules: false,
    preprocessorOptions: {
      scss: {
        loadPaths: ['src'],
      },
    },
  },
})
