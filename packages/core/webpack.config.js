const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

// Try to keep the bundle size under this threshold. Really, it should be much
// smaller than that.
const maxJsSize = 980 * 1000
const maxCssSize = 50 * 1000

module.exports = function () {
  const plugins = [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new OptimizeCssAssetsPlugin(),
  ]

  return {
    entry: path.resolve(__dirname, 'dist/index.js'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'main-bundle.js',
      library: 'ExamBundle',
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    plugins,
    module: {
      rules: [
        {
          test: /\.(less|css)$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { importLoaders: 2, sourceMap: true } },
            { loader: 'postcss-loader', options: { config: { path: __dirname } } },
            {
              loader: 'less-loader',
              options: {
                sourceMap: true,
                lessOptions: {
                  paths: [path.resolve(__dirname, 'src')],
                  plugins: [require('less-plugin-glob')],
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
      maxAssetSize: maxJsSize,
      maxEntrypointSize: maxJsSize + maxCssSize,
      hints: 'error',
    },
  }
}
