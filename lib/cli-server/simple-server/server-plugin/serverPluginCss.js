const fs = require('fs')
const path = require('path')
const {rewriteModule} = require('./rewriteModulePlugin')
const cssExternalRE = /\.(less|sass|scss)(\?.*)$/

module.exports = function ({ app, watcher }) {
  app.use(async (ctx, next) => {
    
    if (!isCSSAsset(ctx.path)) {
      return next()
    }
    
    ctx.type = 'js'
    ctx.body = `export default ${JSON.stringify(ctx.path)}`


  })
}

function isCSSAsset (file) {
    return file.endsWith('.css') || cssExternalRE.test(file)
}