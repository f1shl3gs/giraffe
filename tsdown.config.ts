import {defineConfig} from 'tsdown'

export default defineConfig({
  entry: 'src/index.ts',
  format: ['esm'],
  platform: 'browser',
  target: 'es2022',
  sourcemap: true,
  minify: true,
  /*
    Keep one output file per source file instead of folding everything into a
    single dist/index.js. Bundlers tree-shake at module granularity: with one
    bundled module, <Geo>'s code sits in the same scope as everything else and a
    consumer that never renders it still pays for it. Emitting ~110 small ESM
    files lets the consumer drop Geo, and with it the leaflet import graph.
    Measured with a Vite 8 consumer build: 387 kB (bundled) vs 109 kB (unbundled)
    for an app that only imports <Line>.
  */
  unbundle: true,
  clean: true,
  outDir: 'dist',
  dts: true,
  copy: ['src/fonts', 'node_modules/leaflet/dist/images'],
  deps: {
    neverBundle: ['react', 'react-dom'],
    onlyBundle: false,
  },
  css: {
    transformer: 'postcss',
    modules: false,
    /*
      Emit one dist/style.css rather than a stylesheet per source file. Unbundled
      mode defaults to splitting, which drops the `import './x.css'` statement
      that would pull those files into the graph and leaves them unreferenced.
      Aggregating keeps the single stylesheet consumers import today.
    */
    splitting: false,
    preprocessorOptions: {
      scss: {
        loadPaths: ['src'],
      },
    },
  },
})
