const path = require('path')
const glob = require('glob')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const PurgeCSSPlugin = require('purgecss-webpack-plugin')
const projectRoot = process.cwd()

const setMPA = () => {
  const entry = {}
  const htmlWebpackPlugins = []
  const entryFiles = glob.sync(path.join(projectRoot, './src/*/index.js'))
  Object.keys(entryFiles).map(index => {
    const entryFile = entryFiles[index]
    const match = entryFile.match(/src\/(.*)\/index\.js/)
    const pageName = match && match[1]
    entry[pageName] = entryFile
    htmlWebpackPlugins.push(new HtmlWebpackPlugin({
      template: path.join(projectRoot, `./src/${pageName}/index.html`),
      filename: `${pageName}.html`,
      chunks: [pageName],
      inject: true,
      minify: {
        html5: true,
        collapseWhitespace: true,
        preserveLineBreaks: false,
        minifyCSS: true,
        minifyJS: true,
        removeComments: false
      }
    }))
  })
  return {
    entry,
    htmlWebpackPlugins
  }
}

const { entry, htmlWebpackPlugins } = setMPA()

const PATHS = {
  src: path.join(__dirname, 'src')
}

module.exports = {
  entry,
  stats: 'errors-only',
  output: {
    filename: '[name]_[hash:8].js',
    path: path.join(projectRoot, './dist')
  },
  resolve: {
    modules: [path.resolve(projectRoot, 'node_modules')],
    extensions: ['.js'],
    mainFields: ['main'],
    alias: {
      vue: path.join(projectRoot, './node_modules/vue/dist/vue.runtime.common.js')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          'cache-loader',
          'thread-loader',
          'babel-loader?cacheDirectory',
          // 'babel-loader',
          'eslint-loader'
        ]
      },
      {
        test: /.(png|jpg|gif|jpeg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10240
          }
        }]
      },
      {
        test: /.(woff|woff2|eot|ttf|otf)$/,
        use: 'file-loader'
      },
      {
        test: /.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => {
                require('autoprefixer')({
                  browsers: [
                    'last 2 version',
                    '>1%',
                    'ios >= 7',
                    'android >= 2.0'
                  ]
                })
              }
            }
          }
        ]
      },
      {
        test: /.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader'
        ]
      }
    ]
  },
  plugins: [
    ...htmlWebpackPlugins,
    new FriendlyErrorsWebpackPlugin(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name]_[chunkhash:8].css'
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true })
    }),
    new HardSourceWebpackPlugin()
  ]
}
