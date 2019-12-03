import path from 'path'
import webpack from 'webpack'
import { RenderingOptions } from '.'
import { getWebpackConfig } from './getWebpackConfig'

export function getOfflineWebpackConfig(
  examFilename: string,
  outputDirectory: string,
  examLanguage: string,
  options: RenderingOptions
): webpack.Configuration {
  const attachmentsDirectory = path.resolve(path.dirname(examFilename), 'attachments')

  return getWebpackConfig(
    attachmentsDirectory,
    {
      mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      devtool: false,
      entry: path.resolve(__dirname, 'offline.js'),
      output: {
        path: outputDirectory
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('production'),
          'process.env.EXAM_FILENAME': JSON.stringify(examFilename),
          'process.env.EXAM_LANGUAGE': JSON.stringify(examLanguage),
          'process.env.DETERMINISTIC_RENDERING': JSON.stringify(options.deterministicRendering)
        })
      ]
    },
    examLanguage
  )
}
