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
     * Shape of the data modules. Functional patterns (finders, timing and
     * alignment) always stay square so scanners can lock on reliably.
     * Default: `'square'`.
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
    /**
     * Prefix for the `<defs>` IDs used when `predefined` is set. Defaults to a
     * value unique per render so multiple inline codes in one document don't
     * collide; set it explicitly for deterministic output.
     */
    idPrefix?: string
    /** Pretty-print the SVG output. Default: `true`. */
    pretty?: boolean
    /** Swap X and Y (workaround for some readers). Default: `false`. */
    swap?: boolean
    /** Prepend the `<?xml ... ?>` declaration. Default: `true`. */
    xmlDeclaration?: boolean
    /** Wrapper element. Default: `'svg'`. */
    container?: Container
    /** QR version (1–40). Determined automatically when unset or `< 1`. */
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

export interface WifiOptions {
    /** Network name (required). */
    ssid: string
    /** Network password; omit for open networks. */
    password?: string
    /** Auth type; `'WPA'` covers WPA/WPA2/WPA3. Default: `'WPA'`. */
    encryption?: 'WPA' | 'WEP' | 'nopass'
    /** Whether the SSID is hidden. Default: `false`. */
    hidden?: boolean
}

export interface SmsOptions {
    /** Recipient number (required). */
    phone: string
    /** Pre-filled message body. */
    message?: string
}

export interface EmailOptions {
    /** Recipient address (required). */
    to: string
    subject?: string
    body?: string
    cc?: string
    bcc?: string
}

export interface GeoOptions {
    /** Latitude (required). */
    latitude: number
    /** Longitude (required). */
    longitude: number
    /** Optional label/search term for the pin. */
    query?: string
}

export interface ContactOptions {
    firstName?: string
    lastName?: string
    /** Falls back to "firstName lastName". */
    fullName?: string
    organization?: string
    /** vCard only. */
    title?: string
    /** One or more phone numbers. */
    phone?: string | string[]
    /** One or more email addresses. */
    email?: string | string[]
    url?: string
    address?: string
    note?: string
}

export interface EventOptions {
    /** Event title/summary (required). */
    title: string
    /** Start time (required). A `Date` is formatted as UTC; a string is used as-is. */
    start: Date | string
    /** End time. */
    end?: Date | string
    location?: string
    description?: string
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

    /**
     * Build the `content` string for a Wi-Fi network QR code (the `WIFI:` URI
     * scheme understood by iOS and Android cameras). Pass the result as a
     * QRCode's `content`.
     */
    static wifi(options: WifiOptions): string

    /** Build `content` for a "call this number" QR code (`tel:`). */
    static tel(options: { phone: string } | string): string

    /** Build `content` for a "send a text" QR code (`SMSTO:`). */
    static sms(options: SmsOptions): string

    /** Build `content` for a "compose email" QR code (`mailto:`). */
    static email(options: EmailOptions | string): string

    /** Build `content` for an "open in maps" QR code (`geo:`). */
    static geo(options: GeoOptions): string

    /** Build `content` for an "add contact" QR code in vCard 3.0 format. */
    static vcard(options: ContactOptions): string

    /** Build `content` for an "add contact" QR code in MeCard format. */
    static mecard(options: ContactOptions): string

    /** Build `content` for an "add to calendar" QR code (iCalendar VEVENT). */
    static event(options: EventOptions): string
}
