import { chromium } from 'playwright'
import MarkdownIt from 'markdown-it'
import markdownItKatex from '@traptitech/markdown-it-katex'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItImplicitFigures from 'markdown-it-implicit-figures'
import { readFileSync, unlinkSync, writeFileSync } from 'fs'
import { createStarryNight, common } from '@wooorm/starry-night'
import { toHtml } from 'hast-util-to-html'
import { dirname } from 'path';
import fileUrl from 'file-url'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url));

export class onePagePdf {

    constructor(options) {
        if (options.css === undefined) {
            options.css = readFileSync(__dirname + '/default.css').toString()
        }
        this.htmlPrefix = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" ref="https://cdn.jsdelivr.net/npm/katex@0.16.3/dist/katex.min.css" integrity="sha384-Juol1FqnotbkyZUT5Z7gUPjQ9gzlwCENvUZTpQBAPxtusdwFLRy382PSDx5UUJ4/" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.3/dist/katex.min.js" integrity="sha384-97gW6UIJxnlKemYavrqDHSX3SiygeOwIZhwyOKRfSaf0JWKRVj9hLASHgFTzT+0O" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.3/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossorigin="anonymous" onload="renderMathInElement(document.body)"></script>` +
            //             `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/github.min.css">
            // <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/highlight.min.js"></script>
            // <script>hljs.highlightAll();</script>` +
            `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown.min.css">
<style>
${options.css}
</style>
<title>onePagePdf</title>
</head>
<body>
<article class="markdown-body">
`
        this.htmlSuffix = `</article>
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
        this.markdownIt = new MarkdownIt({
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
                permalink: markdownItAnchor.permalink.headerLink(), slugify: s => String(s).toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_\u3400-\u9FBF\s-]/g, '')
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
        await this.page.setViewportSize({ width: this.options.width, height: this.options.height })
        const height = await this.page.evaluate(() => document.documentElement.scrollHeight)
        const width = await this.page.evaluate(() => document.documentElement.scrollWidth)
        if (this.options.debug) {
            console.log(`height: ${height} + ${this.options.offset}, width: ${width}`)
        }
        await this.page.pdf({ path: path, width: `${width} px`, height: `${height + this.options.offset} px`, printBackground: true, pageRanges: '1' })
    }
}
