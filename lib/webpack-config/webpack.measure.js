const prodConfig = require('./webpack.prod')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { merge } = require('webpack-merge')
const smp = new SpeedMeasurePlugin()

const measureConfig = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}

module.exports = smp.wrap(merge(measureConfig, prodConfig))
