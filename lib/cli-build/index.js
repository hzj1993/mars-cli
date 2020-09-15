const path = require('path')
const { merge } = require('webpack-merge')
const prodConfig = require('../webpack-config/webpack.prod')
const measureConfig = require('../webpack-config/webpack.measure')
const webpack = require('webpack')

module.exports = cmd => {
  const customConfig = require(path.join(process.cwd(), 'none.config.js'))
  const openMeasure = process.argv.includes('-m')

  const finalConfig = openMeasure
    ? merge(customConfig, measureConfig)
    : merge(customConfig, prodConfig)

  finalConfig.entry = customConfig.entry || finalConfig.entry
  finalConfig.output = customConfig.output || finalConfig.output

  webpack(finalConfig, (err, stats) => {
    if (err) {
      console.error(err)
      process.exit(2)
    }
    console.log((stats.toString({
      colors: true,
      modules: false,
      children: false
    })))
  })
}
