# onepagepdf

[![npm version](https://img.shields.io/npm/v/@hasined/onepagepdf)](https://www.npmjs.com/package/@hasined/onepagepdf)
[![npm license](https://img.shields.io/npm/l/@hasined/onepagepdf)](./LICENSE)

> :warning: This project has been deprecated due to heavy dependencies and too messy code. Although you can still use the package, I intend to rewrite it in the future as a minimalistic VS Code plugin.

`onepagepdf` is a command-line tool that leverages technologies like [playwright](https://github.com/microsoft/playwright) and [markdown-it](https://github.com/markdown-it/markdown-it) to convert HTML or Markdown into a single-page PDF.

## Installation

```
npm i -g @hasined/onepagepdf
```

## Usage

```
Usage: onepagepdf [options] <input path> <output path>

Convert Markdown or HTML to one-page-only PDF.

Arguments:
  input path               path to markdown or html, or full url
  output path              path to pdf

Options:
  -V, --version            display current version
  -D, --debug              print debug messages
  --temp <dir>             directory to save temporary files (default: "./.opp_tmp")
  --width <float>          viewport width (default: 816)
  --height <float>         viewport height (default: 500)
  --offset <float>         additional height added to the bottom (default: 32)
  --delay <int>            delay in ms before taking screenshot (default: 1000)
  --color-scheme <string>  emulate color scheme (default: "no-preference")
  --css <path>             custom css file for markdown
  -h, --help               display help for command
```

### Notes

- The height of the generated PDF is determined by `documentElement.scrollHeight`, which accommodates all the content within the viewport, excluding borders and margins. If you require additional margin at the bottom of the PDF, you can utilize the `--offset` option.

- The Markdown style is based on [github-markdown-css](https://github.com/sindresorhus/github-markdown-css) with some customized modifications. For specific details, please refer to the [`default.css`](./default.css) file. If you wish to override certain default settings, you can use the `--css` option to specify your own CSS file.

- Currently, the Markdown-to-HTML conversion supports math rendering with [KaTeX](https://katex.org/) and code highlighting with [starry-night](https://github.com/wooorm/starry-night). Note that not all syntaxes are currently supported. For more complex scenarios, we recommend first converting Markdown to HTML using alternative backends like [pandoc](https://github.com/jgm/pandoc) or [hugo](https://github.com/gohugoio/hugo), and then converting it to a single-page PDF.

## Examples

### CLI

```bash
# Convert webpage to PDF
$ onepagepdf https://github.com/HasiNed/onepagepdf onepage.pdf

# Convert Markdown to PDF, with custom CSS and temp directory
$ onepagepdf README.md ./test/readme.pdf --temp ./test --css ./test/github.css
```

### API

### Import and initialize package

```JavaScript
import { onePagePdf } from '@hasined/onepagepdf'

const engine = new onePagePDF(options)
await engine.init()

/* some code here */

engine.deinit() // close chromium
```

### Convert Markdown to PDF

```JavaScript
const html = await engine.markdownToHTML(/* some markdown */)
await engine.loadHTML(html)
await engine.pageToPDF(/* output path */)
```

### Convert webpage to PDF

```JavaScript
await engine.openURL(/* some url */)
await engine.pageToPDF(/* output path */)
```
