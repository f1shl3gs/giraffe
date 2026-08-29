const path = require('path')

// Vite 8 removed the css.modules.auto regex that this project relied on, so a
// plain .scss file is no longer treated as a CSS Module. giraffe's components
// import `styles` (a class-name map) from plain .X.scss files, so force every
// resolved .scss (outside node_modules) through CSS Module handling by
// rewriting its id to X.module.scss in the same directory (which also keeps
// sass relative `@use`/`@import` resolution working) and serving the real file
// content from a virtual load hook.
function scssAsCssModule() {
  return {
    name: 'stories-scss-as-css-module',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!/\.scss(\?|$)/.test(source)) {
        return null
      }
      const resolved = await this.resolve(source, importer, {skipSelf: true})
      if (!resolved) {
        return null
      }
      const real = resolved.id.split('?')[0]
      if (
        !/\.scss$/.test(real) ||
        real.indexOf('.module.scss') !== -1 ||
        real.indexOf('/node_modules/') !== -1
      ) {
        return null
      }
      return real.replace(/\.scss$/, '.module.scss')
    },
    load(id) {
      const real = id.replace(/\.module\.scss$/, '.scss')
      if (real === id) {
        return null
      }
      return require('fs').promises.readFile(real, 'utf-8')
    },
  }
}

module.exports = {
  stories: ['../src/*.stories.tsx'],
  framework: '@storybook/react-vite',
  addons: ['@storybook/addon-docs'],
  core: {
    builder: '@storybook/builder-vite',
  },
  async viteFinal(config) {
    // giraffe's deps (react-leaflet, etc.) are not hoisted to the workspace
    // root, so Vite must also resolve from giraffe/node_modules.
    config.resolve = config.resolve || {}
    config.resolve.modules = [
      path.resolve(__dirname, '../../giraffe/node_modules'),
      path.resolve(__dirname, '../node_modules'),
      'node_modules',
    ]

    // giraffe's component stylesheets are CSS Modules (even though they use a
    // plain .scss extension); Vite 8 only applies CSS Modules to *.module.scss,
    // so rewrite .scss ids to .module.scss (see scssAsCssModule above).
    config.plugins = (config.plugins || []).concat([scssAsCssModule()])

    return config
  },
}
