const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = function() {
  const plugins = [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new OptimizeCssAssetsPlugin()
  ]

  return {
    mode: 'production',
    entry: path.resolve(__dirname, 'src/main-bundle.ts'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'main-bundle.js',
      library: 'ExamBundle',
      libraryTarget: 'umd'
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },
    plugins,
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: {
            test: /node_modules/
          },
          use: {
            loader: 'ts-loader',
            options: {
              onlyCompileBundledFiles: true
            }
          }
        },
        {
          test: /\.(less|css)$/,
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
          test: /\.(woff|woff2|otf|ttf|eot|svg|png|gif|jpg)$/,
          loader: 'file-loader',
          options: {
            name: 'assets/[name].[ext]'
          }
        }
      ]
    },
    externals: {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react'
      }
    },
    performance: {
      hints: false
    }
  }
}
