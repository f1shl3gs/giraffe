// Rolldown migration of the former webpack pipeline.
//
// Deliverable contract (must stay identical to the webpack build):
//   - entry src/index.ts -> UMD dist/index.js + ESM dist/index.esm.js (+ sourcemaps), global name Giraffe
//   - externals react/react-dom -> UMD globals React/ReactDOM
//   - *.scss = CSS Modules whose scoped class names are BYTE-IDENTICAL to the ones the
//     previous css-loader@5 build produced (cross-module className coupling relies on
//     deterministic names; see generateScopedName below)
//   - png/svg/jpg/gif emitted as `[contenthash:10].[ext]` files (former file-loader)
//   - eot/ttf/woff/woff2/otf inlined as data URIs (former url-loader limit:Infinity)
//   - css injected at runtime via <style> tags (former style-loader)
//
// Why a hand-rolled plugin instead of community ones (verified empirically):
//   - rollup-plugin-sass: no CSS Modules support at all
//   - rollup-plugin-postcss: scopes via postcss-modules but handles neither
//     custom hash schemes reliably for our parity requirement nor url() assets
//     (fonts/images) — swapping it in lost font inlining and every hashed asset.
// Type checking stays in `yarn typecheck`; declarations are emitted by the separate
// `tsc` step in the build script. This file is transpiled by rolldown itself and is
// NOT part of that typecheck program.

import path from 'node:path'
import fs from 'node:fs'
import {fileURLToPath} from 'node:url'
import {defineConfig} from 'rolldown'
import {bundleAnalyzerPlugin} from 'rolldown/experimental'
import type {Plugin} from 'rolldown'
import * as sass from 'sass'
import postcss from 'postcss'
import postcssModules from 'postcss-modules'
// loader-utils ships no type declarations; this config is outside the tsc program.
// @ts-expect-error -- untyped dependency, see note above
import {getHashDigest, interpolateName} from 'loader-utils'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Former webpack `context` (giraffe/) — hashed names depend on paths relative to it.
const ROOT = __dirname

// ---------------------------------------------------------------------------
// CSS Modules scoping — byte-for-byte port of css-loader@5.2.7 defaults.
//
// css-loader computed: interpolateName(ctx, '[hash:base64]', {content}) where
// content = posixPath(file relative to context) + '\0' + localName,
// i.e. md4 digest rendered as standard base64 (24 chars incl '=' padding),
// followed by escapeLocalIdent(): a leading digit/-- gets an '_' prefix and
// filename-reserved chars (notably '/') become '-'. Example verified against
// the previous build output:
//   DapperScrollbars.scss + 'cf-dapper-scrollbars'
//     md4-b64('src/components/DapperScrollbars/DapperScrollbars.scss\0cf-dapper-scrollbars')
//     = 'Jw/Hv1bR+1XYwsb0Hm7d8Q==' -> escaped -> 'Jw-Hv1bR+1XYwsb0Hm7d8Q=='
// ---------------------------------------------------------------------------
function generateScopedName(localName: string, filename: string): string {
  const rel = path.relative(ROOT, filename).split(path.sep).join('/')
  let ident: string = getHashDigest(
    Buffer.from(`${rel}\u0000${localName}`),
    undefined,
    'base64',
    9999
  )

  // escapeLocalIdent (order preserved from css-loader utils.js)
  ident = ident
    .replace(/^((-?[0-9])|--)/, '_$1')
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/[\u0000-\u001f\u0080-\u009f]/g, '-')
    .replace(/\./g, '-')

  // css escape(): the base64 alphabet plus '-' can only hit these rules
  if (/^-[-\d]/.test(ident)) {
    ident = `\\-${ident.slice(1)}`
  }
  return ident
}

// ---------------------------------------------------------------------------
// Assets — replicates file-loader ([contenthash:10].[ext]) and
// url-loader limit:Infinity (fonts -> data URIs).
// ---------------------------------------------------------------------------
type AssetContext = {
  emitFile(file: {
    type: 'asset'
    fileName: string
    name: string
    source: Buffer
  }): void
}

const FONT_EXTENSIONS = new Set(['.eot', '.ttf', '.woff', '.woff2', '.otf'])
const FONT_MIME_TYPES: Record<string, string> = {
  '.eot': 'application/vnd.ms-fontobject',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.otf': 'font/otf',
}
const IMAGE_REGEXP = /\.(png|jpe?g|gif|svg)$/i

function createAssetResolver(context: AssetContext) {
  const resolved = new Map<string, string>()

  function toUrl(referrerDir: string, specifier?: string): string | null {
    if (!specifier || /^(data:|https?:|\/\/|#|about:)/.test(specifier)) {
      return null
    }
    const absolutePath = path.resolve(referrerDir, specifier.split('?')[0])
    if (resolved.has(absolutePath)) {
      return resolved.get(absolutePath) as string
    }

    const source = fs.readFileSync(absolutePath)
    const extension = path.extname(absolutePath).toLowerCase()
    let url: string | null

    if (FONT_EXTENSIONS.has(extension)) {
      url = `data:${FONT_MIME_TYPES[extension]};base64,${source.toString('base64')}`
    } else if (IMAGE_REGEXP.test(absolutePath)) {
      // file-loader: '[contenthash:10].[ext]' == md4 hex (first 10 chars) of content
      const fileName = interpolateName(
        {resourcePath: absolutePath},
        '[contenthash:10].[ext]',
        {content: source}
      ) as string
      context.emitFile({type: 'asset', fileName, name: absolutePath, source})
      url = fileName
    } else {
      return null
    }

    resolved.set(absolutePath, url)
    return url
  }

  return toUrl
}

const URL_REGEXP = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g

function rewriteUrls(
  css: string,
  cssFilePath: string,
  toUrl: ReturnType<typeof createAssetResolver>
): string {
  const referrerDir = path.dirname(cssFilePath)
  return css.replace(
    URL_REGEXP,
    (match: string, quote: string, specifier: string) => {
      const url = toUrl(referrerDir, specifier.trim())
      return url === null ? match : `url(${quote}${url}${quote})`
    }
  )
}

function styleInjectionModule(css: string, cssExportsJson: string): string {
  return [
    `const css = ${JSON.stringify(css)}`,
    `const cssExports = ${cssExportsJson}`,
    `if (typeof document !== 'undefined') {`,
    `  const style = document.createElement('style')`,
    `  style.appendChild(document.createTextNode(css))`,
    `  document.head.appendChild(style)`,
    `}`,
    `export default cssExports`,
  ].join('\n')
}

async function processScss(id: string, context: AssetContext): Promise<string> {
  const {css: compiledCss} = await sass.compileStringAsync(
    fs.readFileSync(id, 'utf8'),
    {
      loadPaths: [path.dirname(id), path.join(ROOT, 'src')],
    }
  )

  const cssWithAssets = rewriteUrls(
    compiledCss,
    id,
    createAssetResolver(context)
  )

  let cssExportsJson = '{}'
  const {css: scopedCss} = await postcss([
    postcssModules({
      generateScopedName,
      getJSON(_filename: string, json: Record<string, string>) {
        cssExportsJson = JSON.stringify(json)
      },
    }),
  ]).process(cssWithAssets, {from: id})

  return styleInjectionModule(scopedCss, cssExportsJson)
}

function processCss(id: string, context: AssetContext): string {
  const source = fs.readFileSync(id, 'utf8')
  const cssWithAssets = rewriteUrls(source, id, createAssetResolver(context))
  return styleInjectionModule(cssWithAssets, '{}')
}

const scssCssAssetsPlugin: Plugin = {
  name: 'giraffe-scss-css-assets',
  async load(id) {
    const [filePath] = id.split('?')
    if (filePath.endsWith('.scss')) {
      return {
        code: await processScss(filePath, this as unknown as AssetContext),
        moduleType: 'js',
      }
    }
    if (filePath.endsWith('.css')) {
      return {
        code: processCss(filePath, this as unknown as AssetContext),
        moduleType: 'js',
      }
    }
    return null
  },
}

export default defineConfig({
  input: path.join(ROOT, 'src/index.ts'),
  // ES2020 syntax floor for every output; oxc leaves modern syntax untouched.
  transform: {
    jsx: 'react',
    target: 'es2020',
  },
  output: [
    {
      dir: path.join(ROOT, 'dist'),
      format: 'umd',
      name: 'Giraffe',
      entryFileNames: 'index.js',
      sourcemap: true,
      minify: true,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    },
    {
      // ESM artifact for bundler consumers (tree-shaking); syntax floor es2020.
      dir: path.join(ROOT, 'dist'),
      format: 'es',
      entryFileNames: 'index.esm.js',
      sourcemap: true,
      minify: true,
    },
  ],
  external: ['react', 'react-dom'],
  platform: 'browser',
  resolve: {
    alias: {
      src: path.join(ROOT, 'src'),
    },
    // mirrors webpack resolve.modules (giraffe deps are not fully hoisted to the
    // workspace root, e.g. react-leaflet)
    modules: [path.join(ROOT, 'node_modules'), 'node_modules'],
  },
  plugins: [
    scssCssAssetsPlugin,
    // 构建产物分析报告:dist/bundle-analysis.md
    bundleAnalyzerPlugin({fileName: 'bundle-analysis.md', format: 'md'}),
  ],
})
