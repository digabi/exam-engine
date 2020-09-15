import { AddressInfo } from 'net'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import { RenderingOptions } from '.'
import { getPreviewWebpackConfig } from './getPreviewWebpackConfig'

export type CloseFunction = () => Promise<void>

export interface PreviewContext {
  url: string
  close: CloseFunction
}

export async function previewExam(examFile: string, options: RenderingOptions = {}): Promise<PreviewContext> {
  const config = getPreviewWebpackConfig(examFile, options)
  const compiler = webpack(config)
  const webpackDevServer = new WebpackDevServer(compiler, config.devServer)

  return new Promise((resolve, reject) => {
    const httpServer = webpackDevServer.listen(options.port ?? 0, 'localhost', (err) => {
      if (err) {
        reject(err)
      } else {
        const addressInfo = httpServer.address() as AddressInfo
        const url = `http://localhost:${addressInfo.port}`
        const close = () => new Promise<void>((resolve) => webpackDevServer.close(resolve))
        resolve({ url, close })
      }
    })
  })
}
