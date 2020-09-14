const dllConfig = require('../webpack-config/webpack.dll')
const webpack = require('webpack')
const chalk = require('chalk')

module.exports = cmd => {
  console.log('=====================================================')
  process.env.IS_DLL = true

  webpack(dllConfig, (err, stats) => {
    if (err) {
      console.error(err)
      process.exit(2)
    }
    console.log((stats.toString({
      colors: true,
      modules: false,
      children: false
    })))

    console.log('Webpack build success')
  })
}
