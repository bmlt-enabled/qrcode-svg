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
