import { ns, parseExam } from '@digabi/mex'
import { promises as fs } from 'fs'
import { AddressInfo } from 'net'
import path from 'path'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import { getOfflineWebpackConfig } from './getOfflineWebpackConfig'
import { getPreviewWebpackConfig } from './getPreviewWebpackConfig'

export interface RenderingOptions {
  casCountdownDurationSeconds?: number
  deterministicRendering?: boolean
  openFirefox?: boolean
}

export type CloseFunction = () => Promise<void>

export async function previewExam(examFile: string, options?: RenderingOptions): Promise<[string, CloseFunction]> {
  const config = getPreviewWebpackConfig(examFile, {
    deterministicRendering: false,
    ...options
  })
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
  options?: RenderingOptions
): Promise<string[]> {
  const source = await fs.readFile(examFile, 'utf-8')
  const doc = parseExam(source)
  const languages = doc
    .root()!
    .find('//e:language/text()', ns)
    .map(String)
  const indexHtml = path.resolve(__dirname, '../public/offline.html')
  const outputFiles = []

  for (const language of languages) {
    const examVersionDirectory = path.resolve(
      outputDirectory,
      `${path.basename(path.dirname(examFile))}_offline_${language}`
    )
    const config = getOfflineWebpackConfig(examFile, examVersionDirectory, language, {
      deterministicRendering: true,
      ...options
    })
    await new Promise<string>((resolve, reject) => {
      webpack(config, (err, stats) => {
        if (err || stats.hasErrors()) {
          reject(err || stats.toString({ colors: true }))
        } else {
          resolve(stats.toString({ colors: true }))
        }
      })
    })

    const examOutputFile = path.resolve(examVersionDirectory, 'koe.html')
    const attachmentsOutputFile = path.resolve(examVersionDirectory, 'aineisto.html')

    await fs.copyFile(indexHtml, examOutputFile)
    await fs.copyFile(indexHtml, attachmentsOutputFile)

    outputFiles.push(examOutputFile, attachmentsOutputFile)
  }

  return outputFiles
}
