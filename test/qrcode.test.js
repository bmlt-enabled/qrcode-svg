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
