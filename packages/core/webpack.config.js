const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = function () {
  const plugins = [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CssMinimizerPlugin(),
  ]

  return {
    entry: path.resolve(__dirname, 'dist/index.js'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: '',
      filename: 'main-bundle.js',
      library: 'ExamBundle',
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    resolve: {
      fallback: { path: false },
    },
    plugins,
    module: {
      rules: [
        {
          test: /\.(less|css)$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { importLoaders: 2, sourceMap: true } },
            { loader: 'postcss-loader', options: { postcssOptions: { config: __dirname } } },
            {
              loader: 'less-loader',
              options: {
                sourceMap: true,
                lessOptions: {
                  paths: [path.resolve(__dirname, 'src')],
                },
              },
            },
          ],
        },
        {
          test: /\.(woff|woff2|otf|ttf|eot|svg|png|gif|jpg)$/,
          loader: 'file-loader',
          options: {
            name: 'assets/[name].[ext]',
          },
        },
      ],
    },
    stats: 'errors-warnings',
    externals: {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react',
      },
    },
    performance: {
      hints: false,
    },
  }
}
