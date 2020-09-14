const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base')
const dllConfig = {
  entry: {
    library: [
      'react',
      'react-dom'
    ]
  },
  output: {
    filename: '[name]_[hash].dll.js',
    path: path.resolve(process.cwd(), './build/library'),
    library: '[name]'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]_[hash]',
      path: path.resolve(process.cwd(), './build/library/[name].json')
    })
  ]
}

module.exports = merge(baseConfig, dllConfig)
