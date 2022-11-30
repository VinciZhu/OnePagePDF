# Onepagepdf

[![npm version](https://img.shields.io/npm/v/@hasined/onepagepdf)](https://www.npmjs.com/package/@hasined/onepagepdf)
[![npm license](https://img.shields.io/npm/l/@hasined/onepagepdf)](./LICENSE)

Onepagepdf is a command line tool that converts HTML or Markdown to PDF as a single long page, implemented by wrapping [playwright](https://github.com/microsoft/playwright), [markdown-it](https://github.com/markdown-it/markdown-it), etc.

## Installation

```
npm i -g @hasined/onepagepdf
```

## Usage

> :warning: This project is in the early stage of development. The API may change in the future.

```
onepagepdf [options] <input path> <output path>
```

### Arguments

```
<input path>      path to markdown or html, or full url
<output path>     path to pdf
```

### Options

```
-V, --version     display current version
--css <path>      specify custom css file for markdown
--wait <value>    specify time to wait for page to load (default: 500)
--width <value>   specify viewport width (default: 1000)
--height <value>  specify viewport height (default: 500)
--offset <value>  specify extra height offset (default: 32)
--temp <path>     write temporary html to <path>
-d, --debug       print debug messages
-h, --help        display help for command
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
opening https://github.com/HasiNed/onepagepdf
pdf saved to onepage.pdf

# Convert Markdown to PDF, with custom CSS
$ onepagepdf README.md ./test/readme.pdf --temp ./test/readme.html --css ./test/github.css
opening README.md
temp saved to ./test/readme.html
pdf saved to ./test/readme.pdf
```

### API

### Import and initialize package

```JavaScript
import { onePagePdf } from '@hasined/onepagepdf'

const engine = new onePagePdf(options)
await engine.init()

/* some code here */

engine.deinit()
```

### Convert Markdown to PDF

```JavaScript
const html = await engine.markdownToHtml(/* some markdown */)
await engine.loadHtml(html)
await engine.pageToPdf(/* output path */)
```

### Convert webpage to PDF
```JavaScript
await engine.openUrl(/* some url */)
await engine.pageToPdf(/* output path */)
```
