Review of @bmlt-enabled/qrcode-svg — 2026-10-26

Reviewed the JavaScript encoder, SVG renderer, public declarations, content helpers, browser playground, downloads, package metadata, documentation, and GitHub workflows. No application source files were changed. The existing build was regenerated; the Git working tree remained clean.

Verification: 59/59 Vitest tests passed; ESLint and Vite build passed; npm audit reported zero known vulnerabilities. Tests ran on Node 24.16.0. Chromium browser reproductions used the built distribution. Independent decoding used jsQR 1.4.0 with PNG images rasterized in Chromium. Leaflet's downloaded JavaScript and CSS matched the committed SRI hashes. This is a local review, not a production deployment or a physical-device scanner certification.

Priority definitions: P1 should be addressed before relying on these flows in a release; P2 is a concrete correctness or compatibility issue to schedule next.

1. **P1 — SVG color options permit script injection in consuming applications.**

   [src/qrcode.js:1497](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/src/qrcode.js:1497), [src/qrcode.js:1582](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/src/qrcode.js:1582), and [src/qrcode.js:1648](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/src/qrcode.js:1648) interpolate `background`, `color`, and `imageBackground` into attributes without escaping. The image URL has an escaping helper, but these options do not use it.

   Browser reproduction: supplying `background: 'white"><image href="/missing-image" onerror="globalThis.__qrAudit=1"/><rect style="fill:white'` and inserting the result through `innerHTML` executes the injected event handler. This is exploitable when a consumer accepts untrusted styling options; the playground's native color pickers do not directly expose this string input. QR content itself was not found to be an injection route.

   Fix: validate supported color values and XML-escape all interpolated attribute values. Add a browser regression that verifies hostile options cannot create extra elements or event handlers.

2. **P1 — Unicode payload bytes are incorrect, and two emoji can overflow.**

   [src/qrcode.js:41](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/src/qrcode.js:41) encodes individual UTF-16 code units using `charCodeAt()`. Its four-byte branch is unreachable; the `> 0x80` and `> 0x800` boundaries are also wrong. Version selection at [src/qrcode.js:1381](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/src/qrcode.js:1381) instead uses `TextEncoder`, so estimated and written lengths disagree.

   Reproductions: `new QRCode('😀😀')` throws `code length overflow. (132>128)`. One emoji writes `EF BB BF ED A0 BD ED B8 80` instead of the valid UTF-8 payload `F0 9F 98 80`; jsQR recovered an empty text string. U+0080 writes `80` instead of `C2 80`; U+0800 writes an invalid two-byte sequence. Japanese text decoded with an extra leading U+FEFF from the injected BOM.

   Fix: encode once with `TextEncoder` and use the same byte array for capacity selection and writing. Decide and test BOM/ECI compatibility deliberately. [The Encoding Standard](https://encoding.spec.whatwg.org/#interface-textencoder) defines TextEncoder's UTF-8 behavior.

3. **P1 — Failed generation leaves the previous QR code downloadable.**

   [examples/index.html:1554](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/examples/index.html:1554) updates the error message without clearing the old preview. Download handlers serialize whatever SVG remains in the container.

   Browser reproduction: load the page, enter `😀😀`, observe the overflow message, then click Download SVG. The old code is still displayed and the download succeeds. The same path applies to excessive content and invalid dimensions. Users can distribute a QR code containing an earlier URL, network, or contact.

   Fix: invalidate the preview and disable both download buttons on every generation failure; enable exports only after a successful render for the current input.

4. **P1 for project-path hosting — The staged Pages site imports the library from the wrong location.**

   [examples/index.html:1319](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/examples/index.html:1319) and [examples/basic.html:6](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/examples/basic.html:6) import `/dist/qrcode.js`. [static.yml:34](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/.github/workflows/static.yml:34) stages the entry page beside a `dist` directory.

   Simulating the staged site at `/qrcode-svg/` produced a request to `/dist/qrcode.js`, a 404, and no rendered code. The artifact would actually be at `/qrcode-svg/dist/qrcode.js`. Root-hosted/custom-domain deployments can work; live Pages settings were not inspected.

   Fix: make asset resolution work for both local examples and the staged base path, preferably through a build-managed entry. Test the generated site under a non-root path.

5. **P2 — Predefined modules collide when multiple QR codes share a document.**

   [src/qrcode.js:1478](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/src/qrcode.js:1478) hard-codes `qrmodule` and `qrfinder` IDs, then references them from every `use` element. Two inline SVGs share the document ID namespace.

   Browser reproduction: render a red 256px code, followed by a blue code with width 512 and `predefined: true`. The second definition is 17.66 units wide, but its rendered `use` measures only 8.83 units, resolving the first code's definition. This also affects grouped QR codes, an explicitly documented use case.

   Fix: generate a distinct definition prefix for each render or accept an explicit prefix, and use it consistently in IDs and references.

6. **P2 — The documented typeNumber option is ignored.**

   [src/qrcode.js:1388](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/src/qrcode.js:1388) always calls automatic version selection. `new QRCode({content:'Hi', typeNumber:40}).qrcode.typeNumber` returns 1; requesting 10 also returns 1. The declarations call it a version hint and README describes setting a version, but it has no effect at all.

   Fix: honor and validate explicit integer versions 1–40, including capacity errors, or remove the option and update both documentation and types.

7. **P2 — Styled modules have reproducible decoding failures.**

   [src/qrcode.js:1442](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/src/qrcode.js:1442) shrinks modules into diamonds or triangles, including functional patterns other than the three finders.

   Reproduction: render `https://bmlt.app` with `ecl:'H'`, `join:true`, and 600px raster width. jsQR failed for diamond and triangle modules inside both square and diamond outer frames. Square, circle, and rounded modules decoded in those same configurations. All five styles decoded in the tested triangle frame, illustrating sensitivity to geometry/rasterization. These results establish a compatibility gap with one decoder, not a claim that every phone fails.

   Fix: preserve all functional patterns, test supported styles across payloads and output sizes, and expose experimental or reliability warnings until supported combinations are verified. Error correction H is not a general guarantee that detection or decoding succeeds.

8. **P2 — Invalid inputs can produce invalid artifacts instead of actionable errors.**

   [src/qrcode.js:1282](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/src/qrcode.js:1282): infinite width or padding passes validation and produces `Infinity`/`NaN` SVG coordinates. A NaN triangle `frameFill` also produces invalid transforms.

   [src/qrcode.js:1946](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/src/qrcode.js:1946): latitude 91 and longitude 181 are accepted; blank strings become `geo:0,0` through numeric coercion.

   [src/qrcode.js:2064](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/src/qrcode.js:2064): an invalid Date produces `DTSTART:NaNNaNNaNTNaNNaNNaNZ`. [src/qrcode.js:1889](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/src/qrcode.js:1889): `QRCode.tel('letters')` returns `tel:` after sanitization.

   Fix: finite numeric checks, coordinate bounds, valid dates, and post-sanitization phone validation. Keep intentionally supported preformatted event strings, but validate their documented format.

9. **P2 — Opening the map moves an equatorial coordinate to latitude 20.**

   [examples/index.html:1614](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/examples/index.html:1614) uses `Number(value) || 20`, treating valid zero as missing. Browser reproduction with latitude 0 and longitude 10 initializes the map center and marker at latitude 20. The text field still says 0, leaving the visual picker inconsistent.

   Fix: distinguish empty/invalid input from a finite zero; use an explicit validity check for defaults.

Additional API/UI issues: `new QRCode('Hi').svg({})` loses its SVG wrapper, even though the type permits an empty SvgOptions object; supplying no argument preserves the wrapper. The logo upload input is hidden and its clickable label has no keyboard-focusable replacement ([examples/index.html:1185](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/examples/index.html:1185)). Map results are click-only `li` elements ([examples/index.html:1692](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/examples/index.html:1692)). Error/status elements do not announce updates through a live region. These should be covered in keyboard and accessibility checks.

The current tooling gives less protection than the green checks suggest:

- **Tests do not decode QR output.** The test titled “produces scannable content when rendered” only checks that the output contains an SVG root ([test/qrcode.test.js:417](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/test/qrcode.test.js:417)). There are no frame/module shape tests or browser download tests. Add round-trip decoding, Unicode/capacity boundaries, style combinations, multiple inline codes, and failed-render export checks. Use deterministic fixtures instead of random payloads where reproducibility matters.
- **ESLint checks only two stylistic rules, both warnings.** [eslint.config.js:20](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/eslint.config.js:20) has no correctness preset. A probe containing `undeclaredThing(); const duplicate = { x: 1, x: 2 };` returned zero errors and zero warnings. Enable correctness rules and lint the example's JavaScript as well; it currently lives in HTML outside this configuration's normal JS coverage.
- **CI lacks a frozen-install check.** Workflows use `npm install`. Prefer `npm ci` so manifest/lockfile disagreements fail instead of being reconciled during CI. [npm ci documentation](https://docs.npmjs.com/cli/v8/commands/npm-ci/) describes its frozen-install behavior.
- **Clean package creation can omit all executable code.** package.json exports only `dist` and has no `prepack` or `prepublishOnly` hook ([package.json:20](/Users/patrick/workspace/git/bmlt-enabled/qrcode-svg/package.json:20)). A dry-run package with the same metadata and no prebuilt dist contained only LICENSE, README, and package.json. The tag workflow explicitly builds, so that path is protected; direct clean packing/publishing is not. The contributing guide incorrectly promises a `prepublishOnly` check at lines 28 and 63. Add a build lifecycle hook and test importing an actual packed package, including TypeScript declarations.
- **Pages deployment is independent of the test job.** It builds and deploys without requiring the reusable checks. Gate deployment on validation of the exact staged output.
- **Development can serve stale generated code.** `npm run serve` runs Vite, but the example imports dist instead of src; fresh clones need a build, and editing src does not update that imported artifact automatically. Make the development entry use source or run an explicit build watcher.
- **Formatting and declarations lack CI checks.** Add a non-mutating format check and a small TypeScript consumer check. The existing `all` command formats files in place and is not a clean validation command.

The most useful product additions would be scan validation before export; warnings for low contrast, insufficient quiet zone, oversized logos, and output modules too small for the selected pixel size; an aspect-ratio lock; a copy button for SVG and generated content; and reusable style presets with reset. Avoid automatically persisting Wi-Fi passwords or contact payloads when adding presets. These are suggestions, separate from the confirmed bugs above.

Suggested order: fix injection, Unicode, stale exports, and hosting paths first; add tests that reproduce them; then correct definitions/version handling and improve styled-code reliability, validation, accessibility, and release tooling.

Browser reproduction script: [qrcode-review-browser.mjs](/tmp/qrcode-review-browser.mjs). It uses existing local Playwright and temporary test dependencies; it is an audit artifact, not a portable project test suite. No live release was published and no production site was changed.
