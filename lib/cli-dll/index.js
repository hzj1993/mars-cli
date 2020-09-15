const dllConfig = require('../webpack-config/webpack.dll')
const webpack = require('webpack')

module.exports = cmd => {
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
  })
}
