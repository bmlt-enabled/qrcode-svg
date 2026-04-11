# Contributing

Thanks for taking the time to contribute!

## Requirements

- Node.js **>= 22**
- npm

## Setup

```bash
git clone https://github.com/bmlt-enabled/qrcode-svg.git
cd qrcode-svg
npm install
```

## Development

| Command              | What it does                               |
| -------------------- | ------------------------------------------ |
| `npm test`           | Run the Vitest suite once                  |
| `npm run test:watch` | Run Vitest in watch mode                   |
| `npm run lint`       | Lint the project with ESLint               |
| `npm run format`     | Format the project with Prettier           |
| `npm run build`      | Build `dist/qrcode.js` via Vite (lib mode) |

Source lives in `src/qrcode.js` (ESM). Tests live in `test/`. The build output is `dist/qrcode.js` and should **not** be committed as part of a PR — CI / `prepublishOnly` will produce it.

## Pull requests

1. Fork and create a feature branch.
2. Make your change with tests.
3. Ensure `npm run lint` and `npm test` both pass.
4. Open a PR against `fork` (or the current default branch) with a clear description.

## Publishing (maintainers)

Releases are published to npm under `@bmlt-enabled/qrcode-svg`.

1. Make sure `main` / `fork` is clean and all checks pass:

    ```bash
    npm run lint
    npm test
    npm run build
    ```

2. Preview exactly what will be published (no upload, no tarball written to disk with `--dry-run`):

    ```bash
    npm pack --dry-run
    ```

    > **Tip:** This lists every file that would end up in the published tarball based on the `files` field in `package.json`. Use it to confirm you're not accidentally shipping tests, source maps, or stray local files — and that `dist/` **is** included.

3. Bump the version (this creates a git tag):

    ```bash
    npm version patch   # or: minor | major
    ```

4. Publish to npm. The `prepublishOnly` script will re-run lint, tests, and the build:

    ```bash
    npm publish --access public
    ```

    > **Note:** Because this is a scoped package (`@bmlt-enabled/...`), npm defaults to a **private** publish and will fail unless you pass `--access public` (or have `publishConfig.access: "public"` set in `package.json`). Always include the flag on the first publish of a new scoped package.

5. Push the commit and tag:

    ```bash
    git push && git push --tags
    ```
