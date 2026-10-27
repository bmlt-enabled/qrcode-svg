# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-10-26

### Security

- **Escape style options in SVG output.** The `color`, `background` and
  `imageBackground` values are now XML-escaped before being interpolated into
  attributes, so a consuming app that passes untrusted styling options and
  inserts the result via `innerHTML` can no longer be injected with extra
  markup or event handlers.

### Fixed

- **UTF-8 encoding of non-ASCII content.** Emoji, CJK, accented Latin and the
  code points around the U+0080/U+0800 boundaries now encode to correct UTF-8
  bytes. Previously they produced invalid bytes, two emoji threw a spurious
  "code length overflow", and a stray byte-order mark was prepended to any
  multibyte content.
- **`typeNumber` is now honored.** An explicit version (`1`–`40`) is used and
  validated — an out-of-range value throws, and content that does not fit the
  requested version throws a capacity error. Previously the option was ignored
  and the version was always chosen automatically.
- **Diamond and triangle modules now scan reliably.** The timing and alignment
  patterns stay square along with the finder patterns, so `moduleShape:
  'diamond'` and `'triangle'` codes decode. Previously these functional
  patterns were stylized, which broke detection.
- **Unique ids for predefined shapes.** Each render now uses a distinct
  `<defs>` id prefix, so multiple inline codes in one document no longer
  resolve to each other's shape definition. A new `idPrefix` option sets the
  prefix explicitly for deterministic output.
- **`svg({})` keeps the wrapper.** Calling `svg()` with an empty options object
  now produces the same wrapped SVG as calling it with no argument.
- **Validation of structured input.** Non-finite `width`, `height`, `padding`
  or `frameFill`, out-of-range or blank `geo` coordinates, a `tel` number with
  no digits, and an invalid `Date` passed to `event` now throw clear errors
  instead of emitting `NaN`, `Infinity` or otherwise invalid output.

### Added

- **`idPrefix` option** to set the `<defs>` id prefix used by `predefined`.
- **Playground improvements** (`examples/`): Copy SVG / Copy content buttons, a
  low-contrast warning, an aspect-ratio lock, and saveable style presets that
  capture visual style only — never the content, Wi-Fi password or contact
  payload. Keyboard and screen-reader support was improved (focusable logo
  upload, live-region error/status messages, keyboard-operable map results),
  the library import path now works under project-path GitHub Pages hosting, a
  failed render no longer leaves the previous code downloadable, and the dev
  server (`npm run serve`) loads source directly for live reload.

### Notes

- The stricter input validation above throws for inputs that previously
  produced invalid output, and `typeNumber` now affects the result. Valid usage
  that already produced correct output is unchanged.

## [1.1.0] - 2026-10-26

### Added

- **Center logo overlay.** New `image` option (URL or data URI) draws a logo in
  the middle of the code, with `imageSize` (fraction of the shorter side),
  `imageBackground` (backdrop fill) and `imageBackgroundShape`
  (`rounded` | `circle` | `none`) to control the backdrop. Use `ecl: 'H'` so the
  covered modules are recovered by error correction.
- **`moduleShape` option.** Render the data modules as `square` (default),
  `diamond` (square-on-point, NA style), `triangle` (AA style), `circle` (dots)
  or `rounded` (rounded squares). The three finder patterns always stay square so
  scanners lock on reliably.
- **`frameShape` option.** Change the overall image ("outer box") shape:
  `square` (default), `diamond` (rotates the whole code 45° to stand on-point,
  NA style) or `triangle` (nests the square code inside a filled triangle badge,
  AA style). The scannable data matrix always stays square. Applies to the `svg`,
  `svg-viewbox` and `g` containers.
- **`frameFill` option.** For `frameShape: 'triangle'`, controls how much of the
  available space the code fills (`0`–`1`, default `0.94`); `1` pushes the code
  right up to the triangle's sides and base.
- **Content helpers.** Static methods that build the `content` string for the
  common QR payload types phone cameras act on, with each format's special
  characters escaped:
  - `QRCode.wifi()` — join a Wi-Fi network (`WIFI:`)
  - `QRCode.tel()` — call a number (`tel:`)
  - `QRCode.sms()` — send a text (`SMSTO:`)
  - `QRCode.email()` — compose an email (`mailto:`)
  - `QRCode.geo()` — open a location in maps (`geo:`)
  - `QRCode.vcard()` / `QRCode.mecard()` — add a contact (vCard 3.0 / MeCard)
  - `QRCode.event()` — add a calendar event (iCalendar VEVENT)
- **Playground controls.** The example app (`examples/`) gained a **Type**
  selector exposing all of the above (Text / URL, Wi-Fi, Phone, SMS, Email,
  Location, Contact vCard/MeCard, Calendar event), plus **Outer Shape**,
  **Module Shape** and a **Code Fill** slider (shown for the triangle frame).
  The Location type includes an expandable OpenStreetMap (Leaflet) picker with a
  draggable pin and Nominatim place search.

### Notes

- All new options are opt-in and backward compatible; omitting them produces the
  same output as 1.0.0.

## [1.0.0] - 2026-04-11

### Added

- Initial release: a dependency-free, ESM-only SVG QR code generator for the
  browser and Node.js (>= 22).
- Core options: `content`, `padding`, `width`, `height`, `color`, `background`,
  `ecl`, `pretty`, `swap`, `xmlDeclaration`, `typeNumber`.
- `join` — merge modules into a single SVG `path`.
- `predefined` — emit modules as a reusable `<defs>`/`<use>` shape.
- `container` output modes: `svg`, `svg-viewbox`, `g`, `none`, `path-data`.

[1.2.0]: https://github.com/bmlt-enabled/qrcode-svg/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/bmlt-enabled/qrcode-svg/releases/tag/v1.1.0
[1.0.0]: https://github.com/bmlt-enabled/qrcode-svg/releases/tag/v1.0.0
