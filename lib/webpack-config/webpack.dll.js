const path = require('path')
const webpack = require('webpack')
const dllConfig = {
  entry: {
    vendor: [
      'vue',
      'vue-router',
      'vuex'
    ]
  },
  output: {
    filename: '[name]_[hash].dll.js',
    path: path.resolve(process.cwd(), './build/vendor'),
    library: '[name]_[hash]'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]_[hash]',
      path: path.resolve(process.cwd(), './build/vendor/[name]-manifest.json')
    })
  ]
}

module.exports = dllConfig
