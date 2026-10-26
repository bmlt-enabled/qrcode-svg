export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export type Container = 'svg' | 'svg-viewbox' | 'g' | 'none' | 'path-data'

export interface QRCodeOptions {
    /** QR Code content (required). */
    content: string
    /** White-space padding in modules. Default: `4`. */
    padding?: number
    /** Image width in pixels. Default: `256`. */
    width?: number
    /** Image height in pixels. Default: `256`. */
    height?: number
    /** Foreground color. Default: `'#000000'`. */
    color?: string
    /** Background color. Default: `'#ffffff'`. */
    background?: string
    /** Error correction level. Default: `'M'`. */
    ecl?: ErrorCorrectionLevel
    /** Join modules into a single `<path>` element. Default: `false`. */
    join?: boolean
    /**
     * Shape of the data modules. Finder patterns always stay square so
     * scanners can lock on reliably. Default: `'square'`.
     * - `'diamond'` — square-on-point (NA style)
     * - `'triangle'` — upward triangle (AA style)
     * - `'circle'` — dots
     * - `'rounded'` — rounded squares
     */
    moduleShape?: 'square' | 'diamond' | 'triangle' | 'circle' | 'rounded'
    /**
     * Overall image ("outer box") shape. The scannable data matrix always
     * stays square. Default: `'square'`.
     * - `'diamond'` — the whole code is rotated 45° to stand on-point (NA look)
     * - `'triangle'` — the square code is nested inside an outlined triangle (AA look)
     *
     * Only applies to the `svg`, `svg-viewbox` and `g` containers.
     */
    frameShape?: 'square' | 'diamond' | 'triangle'
    /**
     * For `frameShape: 'triangle'`, how much of the available space the code
     * fills (`0`–`1`). `1` pushes the code right up to the triangle's sides
     * and base; lower values pull it in. Default: `0.94`.
     */
    frameFill?: number
    /** Use `<defs>`/`<use>` for module shapes. Default: `false`. */
    predefined?: boolean
    /** Pretty-print the SVG output. Default: `true`. */
    pretty?: boolean
    /** Swap X and Y (workaround for some readers). Default: `false`. */
    swap?: boolean
    /** Prepend the `<?xml ... ?>` declaration. Default: `true`. */
    xmlDeclaration?: boolean
    /** Wrapper element. Default: `'svg'`. */
    container?: Container
    /** QR version hint. Default: `4`. */
    typeNumber?: number
    /**
     * Center logo/image to overlay, as a URL or data URI. The image is drawn
     * on top of the modules; covered modules are recovered by error
     * correction, so pair it with a high `ecl` (e.g. `'H'`). Ignored for the
     * `'path-data'` container.
     */
    image?: string
    /** Image size as a fraction of the QR's shorter side (0–1). Default: `0.2`. */
    imageSize?: number
    /** Backdrop fill behind the image. Default: the `background` color. */
    imageBackground?: string
    /** Backdrop shape behind the image. Default: `'rounded'`. */
    imageBackgroundShape?: 'rounded' | 'circle' | 'none'
}

export interface SvgOptions {
    container?: Container
}

export default class QRCode {
    constructor(options: QRCodeOptions | string)
    options: Required<
        Pick<
            QRCodeOptions,
            | 'padding'
            | 'width'
            | 'height'
            | 'color'
            | 'background'
            | 'ecl'
            | 'typeNumber'
        >
    > &
        QRCodeOptions
    svg(options?: SvgOptions): string
}
