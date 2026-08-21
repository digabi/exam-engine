import path from 'path'
import webpack from 'webpack'
import { RenderingOptions } from '.'
import { getWebpackConfig } from './getWebpackConfig'
import { mathSvgResponse } from 'rich-text-editor/server/mathSvg'
import WebpackDevServer from 'webpack-dev-server'

export function getPreviewWebpackConfig(examFilename: string, options: RenderingOptions) {
  return getWebpackConfig({
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: path.resolve(__dirname, 'preview.js'),
    plugins: [
      new webpack.DefinePlugin({
        'process.env.npm_package_name': JSON.stringify(process.env.npm_package_name),
        'process.env.EXAM_FILENAME': JSON.stringify(examFilename),
        'process.env.CAS_COUNTDOWN_DURATION_SECONDS': Number(options.casCountdownDurationSeconds),
        'process.env.EDITABLE_GRADING_INSTRUCTIONS': options.editableGradingInstructions
      })
    ],
    devServer: {
      open: options.openBrowser,
      client: {
        logging: 'none',
        overlay: {
          warnings: true,
          errors: true
        }
      },
      devMiddleware: {
        stats: 'errors-only'
      },
      static: [
        {
          directory: path.resolve(__dirname, '../public')
        },
        { directory: path.dirname(examFilename) }
      ],
      historyApiFallback: true,
      setupMiddlewares: (middlewares: WebpackDevServer.Middleware[], devServer: WebpackDevServer) => {
        devServer.app?.get('/math.svg', mathSvgResponse)
        return middlewares
      }
    }
  })
}
