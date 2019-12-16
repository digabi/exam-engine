import { AddressInfo } from 'net'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import { RenderingOptions } from '.'
import { getPreviewWebpackConfig } from './getPreviewWebpackConfig'

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
