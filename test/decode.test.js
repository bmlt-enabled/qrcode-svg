import { describe, it, expect } from 'vitest'
import sharp from 'sharp'
import jsQR from 'jsqr'
import QRCode from '../src/qrcode.js'

// Round-trip tests: render a QR code to SVG, rasterize it to pixels, and decode
// it back with jsQR. Unlike the structural tests, these assert the output is
// actually scannable — they guard the UTF-8, escaping, version and style
// behavior that only shows up once a real decoder reads the code back.

/** Render options to SVG, rasterize, and return the decoded string (or null). */
async function decode(options) {
    const svg = new QRCode({ width: 600, height: 600, ...options }).svg()
    const { data, info } = await sharp(Buffer.from(svg))
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })
    const code = jsQR(new Uint8ClampedArray(data), info.width, info.height)
    return code ? code.data : null
}

describe('round-trip decoding', () => {
    it('decodes plain ASCII content', async () => {
        expect(await decode({ content: 'https://bmlt.app' })).toBe(
            'https://bmlt.app',
        )
    })

    // Guards the TextEncoder-based UTF-8 fix: these all used to encode wrong
    // bytes (or overflow) with the old charCodeAt() path.
    describe('Unicode content', () => {
        const cases = [
            ['CJK', '会議室 東京'],
            ['single emoji', '😀'],
            ['two emoji (used to overflow)', '😀😀'],
            ['mixed scripts and emoji', 'Hello 世界 😀 café'],
            ['U+0080 boundary', '\u0080\u0081\u0082'],
            ['U+0800 boundary', 'ࠀࠁ'],
            ['accented Latin', 'Mötley Crüe — naïve café'],
        ]
        for (const [label, content] of cases) {
            it(`decodes ${label}`, async () => {
                expect(await decode({ content, ecl: 'M' })).toBe(content)
            })
        }
    })

    it('decodes content written at an explicit typeNumber', async () => {
        // typeNumber must be honored (review #6) and still produce a scannable
        // code at that version.
        const content = 'version pinned'
        expect(await decode({ content, typeNumber: 10 })).toBe(content)
    })

    // Guards the attribute-escaping fix (review #1): a hostile color option
    // must not break out of the style attribute. (A garbage color naturally
    // won't render a scannable code — the guarantee is "no injection", so this
    // asserts the markup, not scannability.)
    it('escapes hostile color options instead of injecting markup', () => {
        const evil =
            'white"><image href="x" onerror="globalThis.__x=1"/><rect style="fill:white'
        const svg = new QRCode({
            content: 'https://bmlt.app',
            background: evil,
            width: 600,
            height: 600,
        }).svg()
        // No injected element or event handler escaped the attribute.
        expect(svg).not.toMatch(/<image\s+href="x"/)
        expect(svg).not.toMatch(/onerror="globalThis/)
        expect(svg).toContain('&quot;')
    })

    it('decodes with a valid custom foreground and background', async () => {
        const content = 'https://bmlt.app'
        expect(
            await decode({ content, color: '#102a43', background: '#f0f4f8' }),
        ).toBe(content)
    })

    // Review #7: every module style must decode. diamond/triangle only became
    // reliable once functional patterns (finders, timing, alignment) were kept
    // square — these assertions guard against that regressing.
    describe('module styles', () => {
        const shapes = ['square', 'circle', 'rounded', 'diamond', 'triangle']
        for (const moduleShape of shapes) {
            it(`decodes ${moduleShape} modules`, async () => {
                const content = 'https://bmlt.app'
                expect(await decode({ content, ecl: 'H', moduleShape })).toBe(
                    content,
                )
            })
            it(`decodes ${moduleShape} modules with join`, async () => {
                const content = 'https://bmlt.app'
                expect(
                    await decode({
                        content,
                        ecl: 'H',
                        moduleShape,
                        join: true,
                    }),
                ).toBe(content)
            })
        }

        // A longer payload forces a higher version with alignment patterns,
        // which must also stay square for diamond/triangle to decode.
        for (const moduleShape of ['diamond', 'triangle']) {
            it(`decodes ${moduleShape} modules in a larger (v3+) code`, async () => {
                const content =
                    'https://bmlt.app/meetings?lat=40.7128&lng=-74.0060&radius=25 — NA meeting finder'
                expect(await decode({ content, ecl: 'H', moduleShape })).toBe(
                    content,
                )
            })
        }
    })

    it('decodes a predefined-shape code and keeps ids unique per render', async () => {
        const content = 'predefined render'
        expect(await decode({ content, predefined: true })).toBe(content)
        // Review #5: two renders must not share definition ids.
        const a = new QRCode({ content: 'A', predefined: true }).svg()
        const b = new QRCode({ content: 'B', predefined: true }).svg()
        const idOf = (svg) => svg.match(/id="([^"]*module)"/)[1]
        expect(idOf(a)).not.toBe(idOf(b))
    })
})
