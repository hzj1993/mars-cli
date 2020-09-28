const fs = require('fs')
const path = require('path')
const hashSum = require('hash-sum')
const {isImportRequest, fileToRequest} = require('../util')
const {clientPath} = require('./serverClientPlugin')

const cssExternalRE = /\.(less|sass|scss)(\?.*)$/

function serverPluginCss ({ app, watcher }) {
  app.use(async (ctx, next) => {
    
    await next()

    if (isCSSAsset(ctx.path) && isImportRequest(ctx)) {
      let filePath = ctx.path
      if (filePath.indexOf('/hmr/') > -1) {
        filePath = filePath.replace('/hmr/', '/')
      }

      const id = hashSum(filePath)
      const css = processCss(filePath)
      ctx.type = 'js'
      ctx.body = codegenCss(id, css)
    }
  })

  watcher.on('change', file => {
    if (isCSSAsset(file)) {
      const filePath = fileToRequest(file)
      // console.log(file)
      // console.log(filePath)
      watcher.send({
        type: 'style-update',
        file: filePath,
        timestamp: Date.now()
      })
    }
  })

  // TODO: 待完善增加预处理器，以及插件处理机制
  function processCss (filePath) {
    const css = fs.readFileSync(path.resolve(process.cwd(), filePath.slice(1)), 'utf-8')
    return css
  }

  function codegenCss (id, source) {
    let code = 
      `import { updateStyle } from "${clientPath}"\n` +
      `const css = ${JSON.stringify(source)}\n` +
      `updateStyle(${JSON.stringify(id)}, css)\n` +
      `export default css`

    return code
  }
}

function isCSSAsset (file) {
  return file.endsWith('.css') || cssExternalRE.test(file)
}

module.exports = {
  serverPluginCss,
  isCSSAsset
}