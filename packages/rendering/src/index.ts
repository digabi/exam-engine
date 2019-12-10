import { getMediaMetadataFromLocalFile, masterExam } from '@digabi/mex'
import { promises as fs } from 'fs'
import { AddressInfo } from 'net'
import path from 'path'
import puppeteer from 'puppeteer'
import uuid from 'uuid'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import { getOfflineWebpackConfig } from './getOfflineWebpackConfig'
import { getPreviewWebpackConfig } from './getPreviewWebpackConfig'

export interface RenderingOptions {
  casCountdownDurationSeconds?: number
  openFirefox?: boolean
}

export type CloseFunction = () => Promise<void>

export async function previewExam(examFile: string, options: RenderingOptions = {}): Promise<[string, CloseFunction]> {
  const config = getPreviewWebpackConfig(examFile, options)
  const compiler = webpack(config)
  const webpackDevServer = new WebpackDevServer(compiler, config.devServer)

  return new Promise((resolve, reject) => {
    const httpServer = webpackDevServer.listen(0, 'localhost', err => {
      if (err) {
        reject(err)
      } else {
        const addressInfo = httpServer.address() as AddressInfo
        const url = `http://localhost:${addressInfo.port}`
        const close = () => new Promise<void>(resolveClose => webpackDevServer.close(resolveClose))
        resolve([url, close])
      }
    })
  })
}

export async function createOfflineExam(
  examFile: string,
  outputDirectory: string,
  prerender: boolean = false
): Promise<string[]> {
  const resolveAttachment = (filename: string) => path.resolve(path.dirname(examFile), 'attachments', filename)
  const source = await fs.readFile(examFile, 'utf-8')
  const outputFiles = []

  for (const result of await masterExam(source, () => uuid.v4(), getMediaMetadataFromLocalFile(resolveAttachment))) {
    const examVersionDirectory = path.resolve(
      outputDirectory,
      `${path.basename(path.dirname(examFile))}_offline_${result.language}`
    )
    const resolveOutputFile = (filename: string) => path.resolve(examVersionDirectory, filename)
    const config = getOfflineWebpackConfig(result, examVersionDirectory)
    await new Promise<string>((resolve, reject) => {
      webpack(config, (err, stats) => {
        if (err || stats.hasErrors()) {
          reject(err || stats.toString({ colors: true }))
        } else {
          resolve()
        }
      })
    })

    for (const { filename } of result.attachments) {
      await fs.copyFile(resolveAttachment(filename), resolveOutputFile(`attachments/${filename}`))
    }

    outputFiles.push(resolveOutputFile('index.html'), resolveOutputFile('attachments/index.html'))
  }

  if (prerender) {
    const browser = await puppeteer.launch()
    try {
      const context = await browser.createIncognitoBrowserContext()
      const page = await context.newPage()
      await page.setViewport({ width: 1920, height: 1200 })
      for (const outputFile of outputFiles) {
        await page.goto('file://' + outputFile, { waitUntil: 'networkidle0' })
        await page.evaluate(() => {
          // Remove rich-text-editor injected styles
          document.head.querySelectorAll(':scope > style').forEach(e => {
            if (e.textContent!.includes('.e-exam')) {
              e.remove()
            }
          })
          // Remove rich-text-editor injected HTML.
          document.body.querySelectorAll(':scope > :not(main)').forEach(e => e.remove())
        })
        const prerenderedContent = await page.content()
        await fs.writeFile(outputFile, prerenderedContent, 'utf-8')
      }
    } finally {
      await browser.close()
    }
  }

  return outputFiles
}
