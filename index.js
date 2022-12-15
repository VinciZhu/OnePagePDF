import { chromium } from "playwright"

import markdownIt from "markdown-it"
import markdownItKatex from "@traptitech/markdown-it-katex"
import markdownItAnchor from "markdown-it-anchor"
import markdownItImplicitFigures from "markdown-it-implicit-figures"

import githubSlugger from "github-slugger"

import { createStarryNight, common } from "@wooorm/starry-night"
import { toHtml } from "hast-util-to-html"

import { dirname } from "path"
import { pathToFileURL, fileURLToPath } from "url"
import { readFileSync, writeFileSync } from "fs"

const __dirname = dirname(fileURLToPath(import.meta.url))

export class onePagePDF {
  constructor(options) {
    if (options.css === undefined) {
      options.css =
        readFileSync(__dirname + "/style/default.css").toString() + options.css
    }
    this.htmlPrefix = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
${options.css}
</style>
<title>Created by onepagepdf</title>
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
    this.slugger = new githubSlugger()
    this.markdownIt = new markdownIt({
      html: true,
      highlight: ((value, lang) => {
        const scope = this.starryNight.flagToScope(lang)
        return toHtml({
          type: "element",
          tagName: "pre",
          properties: {
            className: scope
              ? [
                  "highlight",
                  "highlight-" +
                    scope.replace(/^source\./, "").replace(/\./g, "-"),
                ]
              : undefined,
          },
          children: scope
            ? this.starryNight.highlight(value, scope).children
            : [{ type: "text", value }],
        })
      }).bind(this),
    })
      .use(markdownItKatex)
      .use(markdownItAnchor, {
        permalink: markdownItAnchor.permalink.headerLink(),
        slugify: (s) => this.slugger.slug(s),
      })
      .use(markdownItImplicitFigures, { figcaption: true })
    this.browser = await chromium.launch()
    this.page = await this.browser.newPage()
    await this.page.setViewportSize({
      width: this.options.width,
      height: this.options.height,
    })
    await this.page.emulateMedia({
      colorScheme: this.options.colorScheme,
      media: "print",
    })
  }

  async markdownToHTML(md) {
    return this.htmlPrefix + this.markdownIt.render(md) + this.htmlSuffix
  }

  async loadHTML(html) {
    let path = this.options.temp + ".html"
    if (this.options.debug)
      console.log(`temporary html saved to ${path}`)
    writeFileSync(path, html)
    await this.openURL(pathToFileURL(path).toString())
  }

  async openURL(url) {
    if (this.options.debug)
      console.log(`goto ${url}`)
    await this.page.goto(url)
  }

  async pageToPDF(path) {
    const height =
      (await this.page.evaluate(() => document.documentElement.scrollHeight)) +
      this.options.offset
    const width = await this.page.evaluate(
      () => document.documentElement.scrollWidth
    )
    if (this.options.debug)
      console.log(`pdf size ${height} * ${width}`)
    await this.page.waitForTimeout(this.options.delay)
    await this.page.pdf({
      path: path,
      width: `${width} px`,
      height: `${height} px`,
      printBackground: true,
      pageRanges: "1",
    })
    if (this.options.debug)
      console.log(`output pdf saved to ${path}`)
  }
}
