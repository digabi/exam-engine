import path from 'path'
import webpack from 'webpack'
import { RenderingOptions } from '.'
import { getWebpackConfig } from './getWebpackConfig'
import { mathSvgResponse } from 'rich-text-editor'

export function getPreviewWebpackConfig(examFilename: string, options: RenderingOptions): webpack.Configuration {
  const isDev = process.env.npm_package_name === '@digabi/exam-engine-root'

  return getWebpackConfig({
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: path.resolve(__dirname, 'preview.js'),
    plugins: [
      new webpack.DefinePlugin({
        'process.env.npm_package_name': JSON.stringify(process.env.npm_package_name),
        'process.env.EXAM_FILENAME': JSON.stringify(examFilename),
        'process.env.CAS_COUNTDOWN_DURATION_SECONDS': Number(options.casCountdownDurationSeconds),
      }),
    ],
    resolve: isDev
      ? {
          alias: {
            '@digabi/exam-engine-core$': path.resolve(__dirname, '../../core/dist/index.js'),
            '@digabi/exam-engine-core/dist/main.css$': path.resolve(__dirname, '../../core/src/css/main.less'),
            '@digabi/exam-engine-core/dist': path.resolve(__dirname, '../../core/dist'),
          },
        }
      : {},
    watchOptions: {
      ignored: path.resolve('../../core/dist/main-bundle.js'),
    },
    devServer: {
      overlay: {
        warnings: true,
        errors: true,
      },
      open: options.openFirefox ? 'firefox' : undefined,
      clientLogLevel: 'silent',
      noInfo: true,
      contentBase: [path.resolve(__dirname, '../public'), path.dirname(examFilename)],
      historyApiFallback: true,
      before: (app) => app.get('/math.svg', mathSvgResponse),
    },
  })
}
