#!/usr/bin/env node
import { program } from 'commander'
import isUrl from 'is-url'
import parseUrl from 'url-parse'
import fileUrl from 'file-url';
import { readFileSync } from 'fs'
import { onePagePdf } from './index.js'

const main = async (input, output, options) => {
    if (options.css !== undefined) {
        options.css = readFileSync(options.css).toString()
    }
    const engine = new onePagePdf(options)
    await engine.init()
    console.log(`opening ${input}`)
    var html = ''
    if (input.split('.').pop() == 'md') {
        // Convert markdown to html
        const md = readFileSync(input).toString()
        html = await engine.markdownToHtml(md)
        // Load html to page
        await engine.loadHtml(html)
        if (options.temp !== undefined)
            console.log(`temp saved to ${options.temp}`)
    }
    else {
        // Open URL
        const path = isUrl(input) ? parseUrl(input).toString() : fileUrl(input)
        await engine.openUrl(path)
    }
    // Convert page to pdf
    await engine.pageToPdf(output)
    console.log(`pdf saved to ${output}`)
    engine.deinit()
    process.exit(0)
}

process.removeAllListeners('warning')
const info = await import('./package.json', { assert: { type: 'json' } })
program
    .name('onepagepdf')
    .version(info.default.version, '-V, --version', 'display current version')
    .description(info.default.description)
    .argument('<input path>', 'path to markdown or html, or full url')
    .argument('<output path>', 'path to pdf')
    .option('--css <path>', 'specify custom css file for markdown', undefined)
    .option('--wait <value>', 'specify time to wait for page to load', 500)
    .option('--width <value>', 'specify viewport width', 1000)
    .option('--height <value>', 'specify viewport height', 500)
    .option('--offset <value>', 'specify extra height offset', 32)
    .option('--temp <path>', 'write temporary html to <path>')
    .option('-d, --debug', 'print debug messages')
    .action(main)

program.parse()
