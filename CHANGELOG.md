# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.1.0]: https://github.com/bmlt-enabled/qrcode-svg/releases/tag/v1.1.0
[1.0.0]: https://github.com/bmlt-enabled/qrcode-svg/releases/tag/v1.0.0
