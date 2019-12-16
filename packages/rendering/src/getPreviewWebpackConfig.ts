import path from 'path'
import webpack from 'webpack'
import { RenderingOptions } from '.'
import { getWebpackConfig } from './getWebpackConfig'
const { mathSvgResponse } = require('rich-text-editor') // tslint:disable-line no-var-requires

export function getPreviewWebpackConfig(examFilename: string, options: RenderingOptions): webpack.Configuration {
  return getWebpackConfig({
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: path.resolve(__dirname, 'preview.js'),
    plugins: [
      new webpack.DefinePlugin({
        'process.env.EXAM_FILENAME': JSON.stringify(examFilename),
        'process.env.CAS_COUNTDOWN_DURATION_SECONDS': Number(options.casCountdownDurationSeconds)
      })
    ],
    devServer: {
      overlay: {
        warnings: true,
        errors: true
      },
      open: options.openFirefox ? 'firefox' : undefined,
      quiet: true,
      contentBase: [path.resolve(__dirname, '../public'), path.dirname(examFilename)],
      historyApiFallback: true,
      port: 0,
      before: app => app.get('/math.svg', mathSvgResponse)
    }
  })
}
