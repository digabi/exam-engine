import { MasteringResult } from '@digabi/exam-engine-mastering'
import HTMLInlineCSSWebpackPlugin from 'html-inline-css-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import path from 'path'
import webpack from 'webpack'
import { CreateOfflineExamOptions } from './createOfflineExam'
import { getWebpackConfig } from './getWebpackConfig'

export function getOfflineWebpackConfig(
  result: MasteringResult,
  outputDirectory: string,
  options: CreateOfflineExamOptions
): webpack.Configuration {
  const mode = process.env.NODE_ENV === 'test' ? 'development' : 'production'

  return getWebpackConfig({
    mode,
    devtool: false,
    entry: [require.resolve('@babel/polyfill'), path.resolve(__dirname, 'offline.js')],
    output: {
      path: outputDirectory
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          include: /@digabi\/exam-engine-core/,
          use: {
            loader: require.resolve('babel-loader'),
            options: {
              compact: false,
              plugins: [require.resolve('@babel/plugin-transform-runtime')],
              presets: [
                [
                  require.resolve('@babel/preset-env'),
                  {
                    targets: {
                      chrome: '70',
                      firefox: '60',
                      edge: '18',
                      safari: '12',
                      ios: '12'
                    }
                  }
                ]
              ]
            }
          }
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.EXAM': JSON.stringify(result.xml),
        'process.env.EXAM_LANGUAGE': JSON.stringify(result.language),
        'process.env.MEDIA_VERSION': JSON.stringify(options.mediaVersion)
      }),
      new OptimizeCssAssetsPlugin(),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, '../public/offline.html'),
        title: result.title!,
        backgroundColor: '#e0f4fe',
        scriptSrc: 'main-bundle.js'
      }),
      new HtmlWebpackPlugin({
        filename: 'attachments/index.html',
        template: path.resolve(__dirname, '../public/offline.html'),
        title: result.title!,
        backgroundColor: '#f0f0f0',
        scriptSrc: '../main-bundle.js'
      }),
      new HTMLInlineCSSWebpackPlugin()
    ]
  })
}
