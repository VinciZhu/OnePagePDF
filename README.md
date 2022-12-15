# onepagepdf

[![npm version](https://img.shields.io/npm/v/@hasined/onepagepdf)](https://www.npmjs.com/package/@hasined/onepagepdf)
[![npm license](https://img.shields.io/npm/l/@hasined/onepagepdf)](./LICENSE)

`onepagepdf` is a command line tool that converts HTML or Markdown to PDF as a single long page, implemented by wrapping [playwright](https://github.com/microsoft/playwright), [markdown-it](https://github.com/markdown-it/markdown-it), etc.

## Installation

```
npm i -g @hasined/onepagepdf
```

## Usage

> :warning: This project is in the early stage of development. The API may change in the future.

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
  --width <float>          viewport width (default: 1000)
  --height <float>         viewport height (default: 500)
  --offset <float>         extra height offset (default: 32)
  --delay <int>            time to wait before taking screenshot (default: 500)
  --color-scheme <string>  emulate color scheme (default: "no-preference")
  --css <path>             custom css file for markdown
  -h, --help               display help for command
```
### Notes

-   The height of generated PDF is measured by `documentElement.scrollHeight`, which fits all the content in the viewport excluding borders and margins. You might want to use the option `--offset` to add extra margin to the bottom of the PDF.

-   The style of Markdown is based on [github-markdown-css](https://github.com/sindresorhus/github-markdown-css) with some modifications. See [`default.css`](./default.css) for details. You might want to use the option `--css` to specify your own CSS file to override some default settings.

-   Currently, the Markdown-to-HTML conversion supports math rendering with [KaTeX](https://katex.org/) and code highlighting with [starry-night](https://github.com/wooorm/starry-night). Many other syntaxes may not be supported yet. For more complicated use, we recommend you to first convert Markdown to HTML with other backends, such as [pandoc](https://github.com/jgm/pandoc) and [hugo](https://github.com/gohugoio/hugo), and then convert it to one-page-only PDF.

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

## TODO

-   [ ] Rewrite in TypeScript.
-   [ ] Compatibility for Matt Bierner's [GitHub Markdown Preview](https://marketplace.visualstudio.com/items?itemName=bierner.github-markdown-preview) extension pack in VS Code.
-   [ ] Support bibtex citations in Markdown.
-   [ ] Support copy and paste of KaTeX.