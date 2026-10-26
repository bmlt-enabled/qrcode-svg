import { describe, it, expect } from 'vitest'
import QRCode from '../src/qrcode.js'

function generateRandomString(length) {
    let result = ''
    const charset =
        'abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    for (let i = 0, n = charset.length; i < length; ++i) {
        result += charset.charAt(Math.floor(Math.random() * n))
    }
    return result
}

describe('SVG output', () => {
    it('produces an SVG string with rect elements', () => {
        const qrcode = new QRCode('Hello World!')
        expect(typeof qrcode).toBe('object')
        expect(typeof qrcode.svg).toBe('function')

        const svg = qrcode.svg()
        expect(typeof svg).toBe('string')
        expect(svg).toMatch(/<svg[\s\S]+<\/svg>/)
        expect(svg).toMatch(/<rect[\s\S]+/)
    })
})

describe('padding options', () => {
    it('accepts valid padding and rejects negative', () => {
        expect(() =>
            new QRCode({ content: 'test', padding: 0 }).svg(),
        ).not.toThrow()
        expect(() =>
            new QRCode({ content: 'test', padding: 4 }).svg(),
        ).not.toThrow()
        expect(() =>
            new QRCode({ content: 'test', padding: -1 }).svg(),
        ).toThrow()
    })
})

describe('width and height options', () => {
    it('requires positive dimensions', () => {
        expect(() =>
            new QRCode({ content: 'test', width: 1, height: 1 }).svg(),
        ).not.toThrow()
        expect(() =>
            new QRCode({ content: 'test', width: 1000, height: 1000 }).svg(),
        ).not.toThrow()
        expect(() =>
            new QRCode({ content: 'test', width: 0, height: 0 }).svg(),
        ).toThrow()
        expect(() => new QRCode({ content: 'test', width: -1 }).svg()).toThrow()
        expect(() =>
            new QRCode({ content: 'test', height: -1 }).svg(),
        ).toThrow()
    })
})

describe('ECL options', () => {
    it('supports L/M/Q/H and rejects others', () => {
        expect(() => new QRCode({ content: 'test', ecl: 'L' })).not.toThrow()
        expect(() => new QRCode({ content: 'test', ecl: 'M' })).not.toThrow()
        expect(() => new QRCode({ content: 'test', ecl: 'Q' })).not.toThrow()
        expect(() => new QRCode({ content: 'test', ecl: 'H' })).not.toThrow()
        expect(() => new QRCode({ content: 'test', ecl: 'm' })).toThrow()
        expect(() => new QRCode({ content: 'test', ecl: 'N' })).toThrow()
    })
})

describe('content length', () => {
    it('enforces capacity limits', () => {
        expect(() => new QRCode()).toThrow()
        expect(() => new QRCode({})).toThrow()
        expect(() => new QRCode('')).toThrow()
        expect(() => new QRCode(generateRandomString(1))).not.toThrow()

        expect(
            () =>
                new QRCode({
                    content: generateRandomString(2953),
                    ecl: 'L',
                }),
        ).not.toThrow()
        expect(
            () =>
                new QRCode({
                    content: generateRandomString(2954),
                    ecl: 'L',
                }),
        ).toThrow()
        expect(
            () =>
                new QRCode({
                    content: generateRandomString(2331),
                    ecl: 'M',
                }),
        ).not.toThrow()
        expect(
            () =>
                new QRCode({
                    content: generateRandomString(2332),
                    ecl: 'M',
                }),
        ).toThrow()
        expect(
            () =>
                new QRCode({
                    content: generateRandomString(1663),
                    ecl: 'Q',
                }),
        ).not.toThrow()
        expect(
            () =>
                new QRCode({
                    content: generateRandomString(1664),
                    ecl: 'Q',
                }),
        ).toThrow()
        expect(
            () =>
                new QRCode({
                    content: generateRandomString(1273),
                    ecl: 'H',
                }),
        ).not.toThrow()
        expect(
            () =>
                new QRCode({
                    content: generateRandomString(1274),
                    ecl: 'H',
                }),
        ).toThrow()
    })
})

describe('containers', () => {
    it('svg container has no viewbox', () => {
        const svg = new QRCode({ content: 'test' }).svg({ container: 'svg' })
        expect(svg).toMatch(/<svg\s+/)
        expect(svg).not.toMatch(/viewbox=/i)
    })
    it('svg-viewbox container has viewbox', () => {
        const svg = new QRCode({ content: 'test' }).svg({
            container: 'svg-viewbox',
        })
        expect(svg).toMatch(/<svg\s+/)
        expect(svg).toMatch(/viewbox=/i)
    })
    it('g container has no svg root', () => {
        const svg = new QRCode({ content: 'test' }).svg({ container: 'g' })
        expect(svg).not.toMatch(/<svg\s+/)
        expect(svg).toMatch(/<g[\s>]+/)
    })
    it('none container has no svg or g', () => {
        const svg = new QRCode({ content: 'test' }).svg({ container: 'none' })
        expect(svg).not.toMatch(/<svg\s+/)
        expect(svg).not.toMatch(/<g[\s>]+/)
    })
})

describe('pretty option', () => {
    it('indents by default in svg-viewbox container', () => {
        const svg = new QRCode({ content: 'test' }).svg({
            container: 'svg-viewbox',
        })
        expect(svg).toMatch(/\n\s+<rect\s+/)
    })
    it('disables indent when pretty: false', () => {
        const svg = new QRCode({ content: 'test', pretty: false }).svg({
            container: 'svg-viewbox',
        })
        expect(svg).not.toMatch(/\n\s+<rect\s+/)
    })
})

describe('path-data container', () => {
    it('returns the raw path data', () => {
        const svg = new QRCode({ content: 'test' }).svg({
            container: 'path-data',
        })
        expect(svg.indexOf('M35.31,35.31 V44.14 H44.14 V35.31')).toBe(0)
    })
})

describe('other options', () => {
    it('emits many rect modules by default', () => {
        const svg = new QRCode({ content: 'test' }).svg({ container: 'none' })
        expect(svg.split(/<rect\s+/).length).toBeGreaterThanOrEqual(20)
    })
    it('join: true emits a single path', () => {
        const svg = new QRCode({ content: 'test', join: true }).svg({
            container: 'none',
        })
        expect(svg.split(/<rect\s+/).length - 1).toBe(1)
        expect(svg).toMatch(/<path\s+[^>]+d=/)
    })
    it('predefined: true emits defs/use', () => {
        const svg = new QRCode({ content: 'test', predefined: true }).svg({
            container: 'none',
        })
        expect(svg.split(/<rect\s+/).length - 1).toBe(1)
        expect(svg).toMatch(/<defs[\s>]/)
        expect(svg).toMatch(/<use\s+[^>]+href=/)
    })
})

describe('UTF-8 content', () => {
    it('encodes multi-byte characters without throwing', () => {
        expect(() => new QRCode({ content: '日本語' })).not.toThrow()
        expect(() => new QRCode({ content: 'héllo' })).not.toThrow()
        expect(() => new QRCode({ content: '😀' })).not.toThrow()
        const svg = new QRCode({ content: '日本語' }).svg()
        expect(svg).toMatch(/<svg[\s\S]+<\/svg>/)
    })
})

describe('xmlDeclaration option', () => {
    it('includes xml declaration by default', () => {
        const svg = new QRCode({ content: 'test' }).svg()
        expect(svg).toMatch(/<\?xml/)
    })
    it('omits xml declaration when xmlDeclaration: false', () => {
        const svg = new QRCode({ content: 'test', xmlDeclaration: false }).svg()
        expect(svg).not.toMatch(/<\?xml/)
    })
})

describe('swap option', () => {
    it('swap: true produces different output than swap: false', () => {
        const normal = new QRCode({ content: 'test' }).svg()
        const swapped = new QRCode({ content: 'test', swap: true }).svg()
        expect(swapped).not.toBe(normal)
        expect(swapped).toMatch(/<svg[\s\S]+<\/svg>/)
    })
})

describe('string constructor', () => {
    it('produces valid SVG from string shorthand', () => {
        const svg = new QRCode('Hello World!').svg()
        expect(svg).toMatch(/<svg[\s\S]+<\/svg>/)
        expect(svg).toMatch(/<rect[\s\S]+/)
    })
})

describe('color and background options', () => {
    it('applies custom foreground color', () => {
        const svg = new QRCode({ content: 'test', color: '#ff0000' }).svg()
        expect(svg).toMatch(/fill:#ff0000/)
    })
    it('applies custom background color', () => {
        const svg = new QRCode({
            content: 'test',
            background: '#0000ff',
        }).svg()
        expect(svg).toMatch(/fill:#0000ff/)
    })
})

describe('image (center logo) option', () => {
    const LOGO = 'data:image/png;base64,iVBORw0KGgo='

    it('omits an <image> element when no image is given', () => {
        const svg = new QRCode({ content: 'test' }).svg()
        expect(svg).not.toMatch(/<image\s/)
    })

    it('embeds an <image> with the given href', () => {
        const svg = new QRCode({ content: 'test', image: LOGO }).svg()
        expect(svg).toMatch(/<image\s/)
        expect(svg).toContain('href="' + LOGO + '"')
    })

    it('draws a rounded backdrop by default and supports circle/none', () => {
        const rounded = new QRCode({ content: 'test', image: LOGO }).svg()
        expect(rounded).toMatch(/<rect[^>]+rx=/)

        const circle = new QRCode({
            content: 'test',
            image: LOGO,
            imageBackgroundShape: 'circle',
        }).svg()
        expect(circle).toMatch(/<circle\s/)

        const none = new QRCode({
            content: 'test',
            image: LOGO,
            imageBackgroundShape: 'none',
        }).svg()
        // only the full-canvas background rect, no extra backdrop shape
        expect(none).not.toMatch(/<circle\s/)
        expect(none).not.toMatch(/rx=/)
    })

    it('scales the image with imageSize', () => {
        const small = new QRCode({
            content: 'test',
            image: LOGO,
            imageSize: 0.1,
            width: 300,
            height: 300,
        }).svg()
        const big = new QRCode({
            content: 'test',
            image: LOGO,
            imageSize: 0.4,
            width: 300,
            height: 300,
        }).svg()
        const widthOf = (svg) =>
            Number(svg.match(/<image[^>]+width="([\d.]+)"/)[1])
        expect(widthOf(small)).toBeCloseTo(30, 5)
        expect(widthOf(big)).toBeCloseTo(120, 5)
    })

    it('uses imageBackground color for the backdrop', () => {
        const svg = new QRCode({
            content: 'test',
            image: LOGO,
            imageBackground: '#abcdef',
        }).svg()
        expect(svg).toMatch(/<rect[^>]+fill:#abcdef/)
    })

    it('escapes special characters in the image href', () => {
        const svg = new QRCode({
            content: 'test',
            image: 'https://x.test/l.png?a=1&b=2',
        }).svg()
        expect(svg).toContain('a=1&amp;b=2')
        expect(svg).not.toContain('a=1&b=2')
    })

    it('appears in svg, svg-viewbox, g and none containers', () => {
        for (const container of ['svg', 'svg-viewbox', 'g', 'none']) {
            const svg = new QRCode({ content: 'test', image: LOGO }).svg({
                container,
            })
            expect(svg).toMatch(/<image\s/)
        }
    })

    it('is ignored for the path-data container', () => {
        const svg = new QRCode({ content: 'test', image: LOGO }).svg({
            container: 'path-data',
        })
        expect(svg).not.toMatch(/<image\s/)
    })

    it('rejects a non-string image', () => {
        expect(() => new QRCode({ content: 'test', image: 123 })).toThrow()
    })

    it('rejects an imageSize outside (0, 1]', () => {
        expect(
            () => new QRCode({ content: 'test', image: LOGO, imageSize: 0 }),
        ).toThrow()
        expect(
            () => new QRCode({ content: 'test', image: LOGO, imageSize: 1.5 }),
        ).toThrow()
        expect(
            () => new QRCode({ content: 'test', image: LOGO, imageSize: 1 }),
        ).not.toThrow()
    })
})

describe('QRCode.wifi helper', () => {
    it('builds a WPA network string', () => {
        expect(QRCode.wifi({ ssid: 'MyNet', password: 'secret' })).toBe(
            'WIFI:T:WPA;S:MyNet;P:secret;;',
        )
    })

    it('defaults to WPA encryption and hidden:false', () => {
        expect(QRCode.wifi({ ssid: 'Guest' })).toBe('WIFI:T:WPA;S:Guest;P:;;')
    })

    it('omits the password field for open networks', () => {
        expect(QRCode.wifi({ ssid: 'Open', encryption: 'nopass' })).toBe(
            'WIFI:T:nopass;S:Open;;',
        )
    })

    it('normalizes WPA2/WPA3 to WPA', () => {
        expect(QRCode.wifi({ ssid: 'N', password: 'p', encryption: 'WPA2' })).toBe(
            'WIFI:T:WPA;S:N;P:p;;',
        )
    })

    it('supports WEP and the hidden flag', () => {
        expect(
            QRCode.wifi({
                ssid: 'N',
                password: 'p',
                encryption: 'WEP',
                hidden: true,
            }),
        ).toBe('WIFI:T:WEP;S:N;P:p;H:true;;')
    })

    it('escapes special characters in ssid and password', () => {
        expect(
            QRCode.wifi({ ssid: 'My;Net\\', password: 'a:b,c"d' }),
        ).toBe('WIFI:T:WPA;S:My\\;Net\\\\;P:a\\:b\\,c\\"d;;')
    })

    it('throws without an ssid', () => {
        expect(() => QRCode.wifi({})).toThrow()
        expect(() => QRCode.wifi({ ssid: '' })).toThrow()
    })

    it('throws on an unknown encryption type', () => {
        expect(() =>
            QRCode.wifi({ ssid: 'N', password: 'p', encryption: 'foo' }),
        ).toThrow()
    })

    it('produces scannable content when rendered', () => {
        const content = QRCode.wifi({ ssid: 'MyNet', password: 'secret' })
        const svg = new QRCode({ content, ecl: 'H' }).svg()
        expect(svg).toMatch(/<svg[\s\S]+<\/svg>/)
    })
})

describe('QRCode.tel helper', () => {
    it('builds a tel: URI and strips formatting', () => {
        expect(QRCode.tel({ phone: '(555) 123-4567' })).toBe('tel:5551234567')
        expect(QRCode.tel('+1 555 123 4567')).toBe('tel:+15551234567')
    })

    it('throws without a phone', () => {
        expect(() => QRCode.tel({})).toThrow()
        expect(() => QRCode.tel('')).toThrow()
    })
})

describe('QRCode.sms helper', () => {
    it('builds an SMSTO: URI with and without a message', () => {
        expect(QRCode.sms({ phone: '+15551234567', message: 'Hi there' })).toBe(
            'SMSTO:+15551234567:Hi there',
        )
        expect(QRCode.sms({ phone: '5551234567' })).toBe('SMSTO:5551234567')
    })

    it('throws without a phone', () => {
        expect(() => QRCode.sms({})).toThrow()
    })
})

describe('QRCode.email helper', () => {
    it('builds a mailto: URI with encoded params', () => {
        expect(
            QRCode.email({ to: 'a@b.com', subject: 'Hi & bye', body: 'a b' }),
        ).toBe('mailto:a@b.com?subject=Hi%20%26%20bye&body=a%20b')
    })

    it('accepts a bare address string', () => {
        expect(QRCode.email('a@b.com')).toBe('mailto:a@b.com')
    })

    it('throws without a recipient', () => {
        expect(() => QRCode.email({})).toThrow()
    })
})

describe('QRCode.geo helper', () => {
    it('builds a geo: URI', () => {
        expect(QRCode.geo({ latitude: 38.898, longitude: -77.037 })).toBe(
            'geo:38.898,-77.037',
        )
    })

    it('appends an encoded query label', () => {
        expect(
            QRCode.geo({ latitude: 1, longitude: 2, query: 'My Office' }),
        ).toBe('geo:1,2?q=My%20Office')
    })

    it('throws on non-numeric coordinates', () => {
        expect(() => QRCode.geo({ latitude: 'x', longitude: 2 })).toThrow()
    })
})

describe('QRCode.vcard helper', () => {
    it('builds a vCard with name, phone and email', () => {
        const out = QRCode.vcard({
            firstName: 'Jane',
            lastName: 'Doe',
            phone: '+15551234567',
            email: 'jane@example.com',
        })
        expect(out).toContain('BEGIN:VCARD')
        expect(out).toContain('VERSION:3.0')
        expect(out).toContain('N:Doe;Jane;;;')
        expect(out).toContain('FN:Jane Doe')
        expect(out).toContain('TEL;TYPE=CELL:+15551234567')
        expect(out).toContain('EMAIL:jane@example.com')
        expect(out).toContain('END:VCARD')
    })

    it('supports multiple phones and escapes special characters', () => {
        const out = QRCode.vcard({
            fullName: 'A; B, C',
            phone: ['111', '222'],
        })
        expect(out).toContain('FN:A\\; B\\, C')
        expect(out.match(/TEL;TYPE=CELL:/g).length).toBe(2)
    })

    it('throws without a name', () => {
        expect(() => QRCode.vcard({})).toThrow()
    })
})

describe('QRCode.mecard helper', () => {
    it('builds a MeCard string', () => {
        expect(
            QRCode.mecard({
                firstName: 'Jane',
                lastName: 'Doe',
                phone: '+15551234567',
                email: 'jane@example.com',
            }),
        ).toBe('MECARD:N:Doe,Jane;TEL:+15551234567;EMAIL:jane@example.com;;')
    })

    it('throws without a name', () => {
        expect(() => QRCode.mecard({})).toThrow()
    })
})

describe('QRCode.event helper', () => {
    it('builds a VEVENT with a UTC Date', () => {
        const start = new Date(Date.UTC(2026, 10, 1, 19, 0, 0))
        const end = new Date(Date.UTC(2026, 10, 1, 20, 30, 0))
        const out = QRCode.event({
            title: 'NA Meeting',
            start,
            end,
            location: 'Main St',
        })
        expect(out).toContain('BEGIN:VEVENT')
        expect(out).toContain('SUMMARY:NA Meeting')
        expect(out).toContain('DTSTART:20261101T190000Z')
        expect(out).toContain('DTEND:20261101T203000Z')
        expect(out).toContain('LOCATION:Main St')
        expect(out).toContain('END:VEVENT')
    })

    it('passes a preformatted start string through', () => {
        expect(
            QRCode.event({ title: 'X', start: '20261101T190000Z' }),
        ).toContain('DTSTART:20261101T190000Z')
    })

    it('throws without a title or start', () => {
        expect(() => QRCode.event({ start: new Date() })).toThrow()
        expect(() => QRCode.event({ title: 'X' })).toThrow()
    })
})
