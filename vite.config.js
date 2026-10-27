import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig(({ command }) => ({
    // During `vite` (dev serve) the examples import the built `../dist/qrcode.js`,
    // which would be stale (or missing on a fresh clone). Alias that import to
    // the source so editing `src/` hot-reloads the playground. The production
    // lib build imports `src` directly, so this alias is dev-only.
    resolve:
        command === 'serve'
            ? {
                  alias: [
                      {
                          // Match the whole specifier so the leading `../` is
                          // replaced too (a partial regex match would leave it,
                          // producing a broken path).
                          find: /^\.\.\/dist\/qrcode\.js$/,
                          replacement: resolve(
                              import.meta.dirname,
                              'src/qrcode.js',
                          ),
                      },
                  ],
              }
            : {},
    build: {
        lib: {
            entry: resolve(import.meta.dirname, 'src/qrcode.js'),
            name: 'QRCode',
            formats: ['es'],
            fileName: () => 'qrcode.js',
        },
        sourcemap: false,
        minify: 'oxc',
    },
    test: {
        environment: 'node',
    },
}))
