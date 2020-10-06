const fs = require('fs')
const path = require('path')
const {rewriteModule} = require('./rewriteModulePlugin')
const imageRE = /\.(png|jpe?g|gif|svg|ico|webp)$/
const mediaRE = /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/
const fontsRE = /\.(woff2?|eot|ttf|otf)$/i

exports.serverPluginAsset = function ({ app, watcher }) {
  app.use(async (ctx, next) => {
    
    if (!isStaticAsset(ctx.path)) {
      return next()
    }
    console.log('================= ', ctx.path)
    ctx.type = 'js'
    ctx.body = `export default ${JSON.stringify(ctx.path)}`


  })
}

function isStaticAsset (file) {
    return imageRE.test(file) || mediaRE.test(file) || fontsRE.test(file)
}

exports.isStaticAsset = isStaticAsset