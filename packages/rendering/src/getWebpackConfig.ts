import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import webpack from 'webpack'
import webpackMerge from 'webpack-merge'

export function getWebpackConfig(
  attachmentsDirectory: string,
  configuration: webpack.Configuration,
  examLanguage?: string
): webpack.Configuration {
  return webpackMerge(
    {
      output: {
        filename: 'main-bundle.js'
      },
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: '[name].css'
        })
      ],
      module: {
        rules: [
          {
            test: /\.(less|css)$/,
            exclude: attachmentsDirectory,
            use: [
              MiniCssExtractPlugin.loader,
              { loader: 'css-loader', options: { importLoaders: 2, sourceMap: true } },
              'postcss-loader',
              {
                loader: 'less-loader',
                options: {
                  sourceMap: true,
                  plugins: [require('less-plugin-glob')],
                  paths: [path.resolve(__dirname, 'src')]
                }
              }
            ]
          },
          {
            test: /\.xml$/,
            exclude: attachmentsDirectory,
            use: [
              {
                loader: path.resolve(__dirname, 'exam-loader.js'),
                options: { examLanguage }
              }
            ]
          },
          {
            test: attachmentsDirectory,
            use: {
              loader: 'file-loader',
              options: {
                name: 'attachments/[name].[ext]'
              }
            }
          },
          {
            test: /\.(woff|woff2|otf|ttf|eot|svg|png|gif|jpg)$/,
            exclude: attachmentsDirectory,
            loader: 'file-loader',
            options: {
              name: 'assets/[name].[ext]'
            }
          }
        ]
      },
      performance: {
        hints: false
      }
    },
    configuration
  )
}
