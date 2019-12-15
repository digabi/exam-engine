import { MasteringResult } from '@digabi/exam-engine-mastering'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import path from 'path'
import webpack from 'webpack'
import { getWebpackConfig } from './getWebpackConfig'

export function getOfflineWebpackConfig(result: MasteringResult, outputDirectory: string): webpack.Configuration {
  const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'

  return getWebpackConfig({
    mode,
    devtool: false,
    entry: path.resolve(__dirname, 'offline.js'),
    output: {
      path: outputDirectory
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.EXAM': JSON.stringify(result.xml),
        'process.env.EXAM_LANGUAGE': JSON.stringify(result.language)
      }),
      new OptimizeCssAssetsPlugin(),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, '../public/offline.html'),
        title: result.title!,
        backgroundColor: '#e0f4fe',
        scriptSrc: 'main-bundle.js',
        styleSheetHref: 'main.css'
      }),
      new HtmlWebpackPlugin({
        filename: 'attachments/index.html',
        template: path.resolve(__dirname, '../public/offline.html'),
        title: result.title!,
        backgroundColor: '#f0f0f0',
        scriptSrc: '../main-bundle.js',
        styleSheetHref: '../main.css'
      })
    ]
  })
}
