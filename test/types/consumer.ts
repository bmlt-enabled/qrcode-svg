// Type-level consumer test: compiled with `tsc --noEmit` against the built
// declarations (dist/qrcode.d.ts) to catch declarations that drift from the
// real API. It is never executed — if it type-checks, it passes.

import QRCode from '@bmlt-enabled/qrcode-svg'
import type {
    QRCodeOptions,
    SvgOptions,
    ErrorCorrectionLevel,
    Container,
    WifiOptions,
    GeoOptions,
    EventOptions,
    ContactOptions,
} from '@bmlt-enabled/qrcode-svg'

// Constructor: both the string shorthand and the full options object.
const fromString = new QRCode('Hello world')
const fromOptions = new QRCode({
    content: 'Hi',
    padding: 4,
    width: 512,
    height: 512,
    color: '#000000',
    background: '#ffffff',
    ecl: 'H',
    join: true,
    moduleShape: 'rounded',
    frameShape: 'triangle',
    frameFill: 0.9,
    predefined: true,
    idPrefix: 'qr-',
    typeNumber: 10,
    image: 'data:image/png;base64,AAAA',
    imageSize: 0.2,
    imageBackground: '#ffffff',
    imageBackgroundShape: 'circle',
})

// svg() returns a string, with and without options.
const svgDefault: string = fromString.svg()
const svgWithOpts: string = fromOptions.svg({ container: 'svg-viewbox' })

// The merged `options` field is readable.
const resolvedWidth: number = fromOptions.options.width

// Static content helpers all return strings.
const wifi: string = QRCode.wifi({
    ssid: 'net',
    password: 'pw',
    encryption: 'WPA',
    hidden: false,
})
const tel: string = QRCode.tel('+15551234567')
const telObj: string = QRCode.tel({ phone: '+15551234567' })
const sms: string = QRCode.sms({ phone: '+15551234567', message: 'Hi' })
const email: string = QRCode.email({ to: 'a@b.com', subject: 'S', body: 'B' })
const emailStr: string = QRCode.email('a@b.com')
const geo: string = QRCode.geo({ latitude: 38.9, longitude: -77.0, query: 'HQ' })
const vcard: string = QRCode.vcard({ firstName: 'A', lastName: 'B', phone: ['1', '2'] })
const mecard: string = QRCode.mecard({ fullName: 'A B' })
const event: string = QRCode.event({
    title: 'Meeting',
    start: new Date(),
    end: '20261101T190000Z',
    location: 'Room 1',
})

// Named type exports are usable.
const ecl: ErrorCorrectionLevel = 'Q'
const container: Container = 'g'
const opts: QRCodeOptions = { content: 'x' }
const svgOpts: SvgOptions = {}
const wifiOpts: WifiOptions = { ssid: 'n' }
const geoOpts: GeoOptions = { latitude: 0, longitude: 0 }
const eventOpts: EventOptions = { title: 't', start: '20261101T190000Z' }
const contactOpts: ContactOptions = { fullName: 'A B' }

// Reference every binding so this stays a pure type check, not a lint target.
void [
    fromString,
    fromOptions,
    svgDefault,
    svgWithOpts,
    resolvedWidth,
    wifi,
    tel,
    telObj,
    sms,
    email,
    emailStr,
    geo,
    vcard,
    mecard,
    event,
    ecl,
    container,
    opts,
    svgOpts,
    wifiOpts,
    geoOpts,
    eventOpts,
    contactOpts,
]
