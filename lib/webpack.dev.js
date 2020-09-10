const {merge} = require('webpack-merge')
const baseConfig = require('./webpack.base')
const devConfig = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
    hot: true,
    stats: 'errors-only'
  }
}
module.exports = merge(baseConfig, devConfig)
