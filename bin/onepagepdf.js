#!/usr/bin/env node
import { program, Option } from 'commander'
import { readFileSync, mkdirSync } from 'fs'
import { onePagePDF } from '../index.js'

const main = async (input, output, options) => {
  // Load css file
  if (options.css !== undefined)
    options.css = readFileSync(options.css).toString()

  // Make temporary dir
  mkdirSync(options.temp, { recursive: true })
  options.temp = options.temp + '/' + output.split('/').pop().split('.')[0]

  // Initialize
  const engine = new onePagePDF(options)
  await engine.init()

  // Load input
  if (input.startsWith('http://') || input.startsWith('https://')) {
    await engine.openURL(input)
  } else {
    let html = ''
    if (input.endsWith('.md')) {
      const md = readFileSync(input).toString()
      html = await engine.markdownToHTML(md)
    } else if (input.endsWith('.html')) {
      html = readFileSync(input).toString()
    }
    await engine.loadHTML(html)
  }

  // Convert to pdf
  await engine.pageToPDF(output)

  engine.deinit()
  process.exit(0)
}

process.removeAllListeners('warning')
const info = await import('../package.json', { assert: { type: 'json' } })
program
  .name('onepagepdf')
  .version(info.default.version, '-V, --version', 'display current version')
  .description(info.default.description)
  .argument('<input path>', 'path to markdown or html, or full url')
  .argument('<output path>', 'path to pdf')
  .addOption(new Option('-D, --debug', 'print debug messages'))
  .addOption(
    new Option('--temp <dir>', 'directory to save temporary files').default(
      './.opp_tmp'
    )
  )
  .addOption(
    new Option('--width <float>', 'viewport width')
      .default(816)
      .argParser(parseFloat)
  )
  .addOption(
    new Option('--height <float>', 'viewport height')
      .default(500)
      .argParser(parseFloat)
  )
  .addOption(
    new Option('--offset <float>', 'additional height added to the bottom')
      .default(32)
      .argParser(parseFloat)
  )
  .addOption(
    new Option('--color-scheme <string>', 'emulate color scheme').default(
      'no-preference'
    )
  )
  .addOption(new Option('--css <path>', 'custom css file for markdown'))
  .action(main)

program.parse()
