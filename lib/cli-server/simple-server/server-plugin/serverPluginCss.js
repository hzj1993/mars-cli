const fs = require('fs')
const path = require('path')
const {rewriteModule} = require('./rewriteModulePlugin')
const cssExternalRE = /\.(less|sass|scss)(\?.*)$/

module.exports = function ({ app, watcher }) {
  app.use(async (ctx, next) => {
    await next()

    if (isCSSAsset(ctx.path) && ctx.body) {
      ctx.type = 'js'
      ctx.body = `export default ${JSON.stringify(ctx.path)}`
    }
  })
  function codegenCss (code) {

  }
}



function isCSSAsset (file) {
    return file.endsWith('.css') || cssExternalRE.test(file)
}