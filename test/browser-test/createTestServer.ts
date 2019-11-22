import { AddressInfo } from 'net'
import Webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import webpackConfig from '../../webpack.config'

export type CloseFunction = () => Promise<void>

export default function createTestServer(xmlPath: string): Promise<[string, CloseFunction]> {
  const config = webpackConfig({
    EXAM_FILENAME: xmlPath,
    DETERMINISTIC_RENDERING: true,
    CAS_COUNTDOWN_DURATION_SECONDS: 2
  }) as Webpack.Configuration
  const compiler = Webpack(config)
  const webpackDevServer = new WebpackDevServer(compiler, config.devServer!)
  return new Promise((resolve, reject) => {
    const httpServer = webpackDevServer.listen(0, 'localhost', err => {
      if (err) {
        reject(err)
      } else {
        const port = (httpServer.address() as AddressInfo).port
        const url = `http://localhost:${port}`
        const close = () => new Promise<void>(resolveClose => webpackDevServer.close(resolveClose))
        resolve([url, close])
      }
    })
  })
}
