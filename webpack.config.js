const webpack = require('webpack')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const mathSvgHandler = require('rich-text-editor').mathSvgResponse

module.exports = function(env) {
  const examFilename = (env && env.EXAM_FILENAME) || path.resolve(__dirname, './exams/MexDocumentation/MexDocumentation.xml')
  const attachmentsDirectory = path.join(path.dirname(examFilename), 'attachments')
  const examLanguage = env && env.EXAM_LANGUAGE
  const generateGradingStructure = env && env.GENERATE_GRADING_STRUCTURE
  const deterministicRendering = env && env.DETERMINISTIC_RENDERING
  const isOffline = env != null && env.OFFLINE != null
  const transpileOnly = process.env.TYPECHECK == null

  const plugins = [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(transpileOnly ? 'production' : 'development'),
      'process.env.EXAM_FILENAME': JSON.stringify(examFilename),
      'process.env.EXAM_LANGUAGE': JSON.stringify(examLanguage),
      'process.env.GENERATE_GRADING_STRUCTURE': JSON.stringify(generateGradingStructure),
      'process.env.DETERMINISTIC_RENDERING': deterministicRendering,
      'process.env.CAS_COUNTDOWN_DURATION_SECONDS': JSON.stringify(Number(env.CAS_COUNTDOWN_DURATION_SECONDS))
    })
  ]

  return {
    mode: isOffline ? 'production' : 'development',
    devtool: !isOffline && 'cheap-module-source-map',
    entry: [path.resolve(__dirname, isOffline ? 'offline.tsx' : 'preview.tsx')],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'main-bundle.js'
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },
    plugins,
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: [/node_modules/, attachmentsDirectory],
          use: {
            loader: 'ts-loader',
            options: {
              onlyCompileBundledFiles: true,
              transpileOnly
            }
          }
        },
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
              options: { examLanguage, generateGradingStructure }
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
    },
    devServer: {
      overlay: {
        warnings: true,
        errors: true
      },
      quiet: true,
      stats: {
        warningsFilter: /export .* was not found in/
      },
      contentBase: [path.resolve(__dirname, 'public'), path.dirname(examFilename)],
      historyApiFallback: true,
      port: 0,
      before: function(app) {
        app.get('/math.svg', mathSvgHandler)
      }
    }
  }
}
