import { AddressInfo } from 'net'
import webpack from 'webpack'
import { RenderingOptions } from '.'
import { getPreviewWebpackConfig } from './getPreviewWebpackConfig'
import * as net from 'net'
import Server from 'webpack-dev-server'

export type CloseFunction = () => Promise<unknown>

export interface PreviewContext {
  url: string
  close: CloseFunction
}

export async function previewExam(examFile: string, options: RenderingOptions = {}): Promise<PreviewContext> {
  const config = getPreviewWebpackConfig(examFile, options)
  const compiler = webpack(config)
  if (!compiler) {
    throw new Error('Failed to create webpack compiler')
  }
  const devServer = config.devServer!
  const webpackDevServer: Server = new Server({ ...devServer, port: options.port ?? 0, host: 'localhost' }, compiler)
  return new Promise((resolve, reject) => {
    webpackDevServer.startCallback(err => {
      if (err) {
        reject(err)
      } else {
        const addressInfo = (webpackDevServer.server as net.Server).address() as AddressInfo
        const url = `http://localhost:${addressInfo.port}`
        const close = () => webpackDevServer.stop()
        resolve({ url, close })
      }
    })
  })
}
