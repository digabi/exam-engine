import { AddressInfo } from 'net'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import { RenderingOptions } from '.'
import { getPreviewWebpackConfig } from './getPreviewWebpackConfig'
import * as net from 'net'

export type CloseFunction = () => Promise<unknown>

export interface PreviewContext {
  url: string
  close: CloseFunction
}

export async function previewExam(examFile: string, options: RenderingOptions = {}): Promise<PreviewContext> {
  const config = getPreviewWebpackConfig(examFile, options)
  const compiler = webpack(config)
  const devServer = config.devServer!
  const webpackDevServer = new WebpackDevServer(compiler, devServer)
  return new Promise((resolve, reject) => {
    webpackDevServer.listen(options.port ?? 0, 'localhost', (err) => {
      if (err) {
        reject(err)
      } else {
        const addressInfo = (webpackDevServer.server as net.Server).address() as AddressInfo
        const url = `http://localhost:${addressInfo.port}`
        const close = () => new Promise((resolve) => webpackDevServer.close(resolve))
        resolve({ url, close })
      }
    })
  })
}
