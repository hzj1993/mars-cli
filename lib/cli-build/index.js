const path = require('path')
const { merge } = require('webpack-merge')
const prodConfig = require('../webpack-config/webpack.prod')
const webpack = require('webpack')
const chalk = require('chalk')

module.exports = cmd => {
  const customConfig = require(path.join(process.cwd(), 'none.config.js'))
  const finalConfig = merge(customConfig, prodConfig)
  finalConfig.entry = customConfig.entry
  finalConfig.output = customConfig.output

  webpack(finalConfig, (err, stats) => {
    if (err) {
      console.err(chalk.red(err))
      process.exit(2)
    }
    console.log((stats.toString({
      colors: true,
      modules: false,
      children: false
    })))

    console.log('Webpack build success, begin run test.')
  })

  console.log(finalConfig)
}
