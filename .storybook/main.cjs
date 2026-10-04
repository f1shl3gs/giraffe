const path = require('path')

module.exports = {
  // Stories live outside src/ so they are never emitted into the published
  // declarations. tsconfig.json still includes them for typechecking; the
  // build's tsconfig.build.json does not (see the `build` script).
stories: ['../stories/**/*.stories.tsx'],
  framework: '@storybook/react-vite',
  addons: ['@storybook/addon-docs'],
  core: {
    builder: '@storybook/builder-vite',
  },
  async viteFinal(config) {
    // Storybook derives Vite's root from the static prefix of the `stories`
    // glob, so moving the glob would move the root and leave every module 404.
    // Pin it to the repo root; the glob above is resolved against this config's
    // directory, so the two stay independent.
    config.root = path.resolve(__dirname, '..')

    const srcPath = path.resolve(__dirname, '../src')
    // `stories` is the one bare specifier that does not live under src/.
    const storiesPath = path.resolve(__dirname, '../stories')

    config.resolve = config.resolve || {}
    /*
      Mirrors the `paths` alias in tsconfig.json. Without this, a bare
      `from 'constants'` resolves to Node's built-in `constants` module — Vite
      externalizes it for browser compatibility and the import silently becomes
      undefined. Any of src's bare specifiers ('types', 'utils/x',
      'components/x') hit the same thing.
    */
    /*
      Mirrors the `paths` alias in tsconfig.json. Without this, a bare
      `from 'transforms'` is looked up in node_modules only: `constants` even
      resolves to Node's built-in module, which Vite externalizes for browser
      compatibility so the import silently becomes undefined. `resolve.modules`
      alone is not enough in Vite 8 -- it left 'transforms' unresolved.

      Each entry needs an exact and a prefix form, so both `from 'types'` and
      `from 'utils/geo'` resolve. Order matters: exact before prefix.
    */
    const bareSpecifiers = [
      'components',
      'constants',
      'hooks',
      'style',
      'transforms',
      'types',
      'utils',
    ]
    config.resolve.alias = [
      ...(Array.isArray(config.resolve.alias)
        ? config.resolve.alias
        : Object.entries(config.resolve.alias || {}).map(([find, replacement]) =>
            ({find, replacement})
          )),
      ...[
        ...bareSpecifiers.map(name => [name, srcPath]),
        // base is the PARENT of the directory: path.join(base, name).
        ['stories', path.resolve(__dirname, '..')],
      ].flatMap(([name, base]) => [
        {
          find: new RegExp(`^${name}$`),
          replacement: path.join(base, name),
        },
        {
          find: new RegExp(`^${name}/`),
          replacement: path.join(base, name) + '/',
        },
      ]),
    ]
    config.resolve.extensions = [
      '.ts',
      '.tsx',
      '.mjs',
      '.js',
      '.jsx',
      '.json',
    ]
    // The stories import each other by these bare names, so they need to resolve
    // against src/ rather than node_modules.
    config.resolve.modules = [
      srcPath,
      storiesPath,
      path.resolve(__dirname, '../node_modules'),
      'node_modules',
    ]

    // `@use 'style/variables'` inside a component resolves against src/, the
    // same loadPath tsdown.config.ts sets for the library build.
    config.css = config.css || {}
    config.css.preprocessorOptions = config.css.preprocessorOptions || {}
    config.css.preprocessorOptions.scss = {
      ...(config.css.preprocessorOptions.scss || {}),
      loadPaths: [srcPath],
    }

    return config
  },
}
