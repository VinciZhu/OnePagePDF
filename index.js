import { chromium } from 'playwright'
import markdownIt from 'markdown-it'
import markdownItKatex from '@traptitech/markdown-it-katex'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItImplicitFigures from 'markdown-it-implicit-figures'
import { readFileSync, unlinkSync, writeFileSync } from 'fs'
import { createStarryNight, common } from '@wooorm/starry-night'
import { toHtml } from 'hast-util-to-html'
import { dirname } from 'path';
import fileUrl from 'file-url'
import { fileURLToPath } from 'url'
import githubSlugger from 'github-slugger'

const __dirname = dirname(fileURLToPath(import.meta.url));

export class onePagePdf {

    constructor(options) {
        options.css = readFileSync(__dirname + '/default.css').toString() + options.css
        this.htmlPrefix =
            `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.3/katex.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown.min.css">
<style>
${options.css === undefined ? ' ' : options.css}
</style>
<title>onePagePdf</title>
</head>
<body>
<article class="markdown-body">
`
        this.htmlSuffix =
            `</article>
</body>
</html>
`
        this.options = options
    }

    async deinit() {
        await this.browser.close()
    }

    async init() {
        this.starryNight = await createStarryNight(common)
        this.slugger = new githubSlugger()
        this.markdownIt = new markdownIt({
            html: true,
            highlight: ((value, lang) => {
                const scope = this.starryNight.flagToScope(lang)
                return toHtml({
                    type: 'element',
                    tagName: 'pre',
                    properties: {
                        className: scope
                            ? [
                                'highlight',
                                'highlight-' + scope.replace(/^source\./, '').replace(/\./g, '-')
                            ]
                            : undefined
                    },
                    children: scope
                        ? this.starryNight.highlight(value, scope).children
                        : [{ type: 'text', value }]
                })
            }).bind(this)
        })
            .use(markdownItKatex)
            .use(markdownItAnchor, {
                permalink: markdownItAnchor.permalink.headerLink(),
                slugify: s => this.slugger.slug(s)
            })
            .use(markdownItImplicitFigures, { figcaption: true })
        this.browser = await chromium.launch()
        this.page = await this.browser.newPage()
    }

    async markdownToHtml(md) {
        return this.htmlPrefix + this.markdownIt.render(md) + this.htmlSuffix
    }

    async loadHtml(html) {
        if (this.options.temp === undefined) {
            writeFileSync('temp.onepagepdf.html', html)
            await this.page.goto(fileUrl('temp.onepagepdf.html'))
            unlinkSync('temp.onepagepdf.html')
        } else {
            writeFileSync(this.options.temp, html)
            await this.page.goto(fileUrl(this.options.temp))
        }
    }

    async openUrl(path) {
        await this.page.goto(path)
    }

    async pageToPdf(path) {
        await this.page.setViewportSize({ width: parseFloat(this.options.width), height: parseFloat(this.options.height) })
        const height = await this.page.evaluate(() => document.documentElement.scrollHeight) + parseFloat(this.options.offset)
        const width = await this.page.evaluate(() => document.documentElement.scrollWidth)
        if (this.options.debug) {
            console.log(`height: ${height}, width: ${width}`)
        }
        await this.page.waitForTimeout(parseInt(this.options.wait))
        await this.page.pdf({ path: path, width: `${width} px`, height: `${height} px`, printBackground: true, pageRanges: '1' })
    }
}
