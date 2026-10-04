import path from 'node:path'
import {defineConfig} from 'vitest/config'

export default defineConfig({
  resolve: {
    // src 内一律用裸标识符互相引用（与 tsconfig paths、.storybook/main.cjs 一致），
    // 所以测试运行器也必须认这些名字，否则任何非相对导入都无法解析。
    alias: Object.fromEntries([
      ...['components', 'constants', 'hooks', 'style', 'types', 'utils'].map(
        name => [name, path.resolve(__dirname, 'src', name)],
      ),
      // `stories` is the one bare specifier that does not live under src/.
      ['stories', path.resolve(__dirname, 'stories')],
    ]),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
