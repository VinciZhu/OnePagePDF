# OnePagePDF

> :warning: **Deprecated:** This project has been deprecated due to heavy dependencies and messy code. While you can still use it, I plan to rewrite it as a minimalistic VS Code plugin in the future.

`onepagepdf` is a CLI tool that converts HTML or Markdown into a single-page PDF using [playwright](https://github.com/microsoft/playwright) and [markdown-it](https://github.com/markdown-it/markdown-it).

## Installation

```bash
npm i -g @hasined/onepagepdf
```

## Usage

```bash
onepagepdf [options] <input path> <output path>
```

Convert Markdown or HTML to a single-page PDF.

### Arguments
- **input path**: Path to Markdown, HTML, or full URL.
- **output path**: Path to the output PDF.

### Options
- `-V, --version`: Display current version.
- `-D, --debug`: Show debug messages.
- `--temp <dir>`: Directory for temporary files (default: `./.opp_tmp`).
- `--width <float>`: Viewport width (default: 816).
- `--height <float>`: Viewport height (default: 500).
- `--offset <float>`: Additional bottom margin (default: 32).
- `--delay <int>`: Delay in ms before screenshot (default: 1000).
- `--color-scheme <string>`: Emulate color scheme (default: "no-preference").
- `--css <path>`: Custom CSS file for Markdown.
- `-h, --help`: Display help for command.

## Notes

- The PDF height is based on `documentElement.scrollHeight`, accommodating content inside the viewport. Use `--offset` for extra bottom margin.
- Markdown styling is based on [github-markdown-css](https://github.com/sindresorhus/github-markdown-css) with custom modifications. Use `--css` to override defaults.
- Math rendering (via [KaTeX](https://katex.org/)) and code highlighting (via [starry-night](https://github.com/wooorm/starry-night)) are supported. For complex cases, consider using tools like [pandoc](https://github.com/jgm/pandoc) or [hugo](https://github.com/gohugoio/hugo) for Markdown-to-HTML conversion.

## Examples

### CLI

```bash
# Convert a webpage to PDF
onepagepdf https://github.com/HasiNed/onepagepdf onepage.pdf

# Convert Markdown to PDF with custom CSS and temp directory
onepagepdf README.md ./test/readme.pdf --temp ./test --css ./test/github.css
```

### API

```JavaScript
import { onePagePdf } from '@hasined/onepagepdf'

const engine = new onePagePDF(options)
await engine.init()

// Convert Markdown to HTML and save as PDF
const html = await engine.markdownToHTML(/* markdown content */)
await engine.loadHTML(html)
await engine.pageToPDF(/* output path */)

engine.deinit() // close Chromium
```

### Convert webpage to PDF

```JavaScript
await engine.openURL(/* webpage URL */)
await engine.pageToPDF(/* output path */)
```
