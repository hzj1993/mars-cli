const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path')
const fs = require('fs')
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const { merge } = require('webpack-merge')
const webpack = require('webpack')
const baseConfig = require('./webpack.base')
const prodConfig = {
  mode: 'production',
  plugins: [
    new HtmlWebpackExternalsPlugin({
      externals: [
        {
          module: 'react',
          entry: 'https://unpkg.com/react@16/umd/react.production.min.js',
          global: 'React'
        }, {
          module: 'react-dom',
          entry: 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js',
          global: 'ReactDOM'
        }
      ]
    }),
    new OptimizeCssAssetsWebpackPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano')
    })
  ],
  optimization: {
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2
        }
      }
    },
    minimizer: [
      new TerserWebpackPlugin({
        parallel: true
      })
    ]
  }
}

installDll()

function installDll () {
  const manifestPath = path.join(process.cwd(), './build/library/library.json');
  if (fs.existsSync(manifestPath)) {
    prodConfig.plugins.push(
      new webpack.DllReferencePlugin({
        manifest: require(manifestPath)
      })
    )
  }
}

module.exports = merge(baseConfig, prodConfig)
