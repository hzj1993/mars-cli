const fs = require('fs')
const path = require('path')
const {rewriteModule} = require('./rewriteModulePlugin')
const compilerSFC = require('@vue/compiler-sfc')
const compilerDom = require('@vue/compiler-dom')
const {fileToRequest} = require('../util')
const isWin = require('os').platform() === 'win32'
const pathSeparator = isWin ? '\\' : '/'

module.exports = function ({ app, watcher }) {
  app.use(async (ctx, next) => {
    if (!ctx.path.endsWith('.vue')) {
      return next()
    }

    let filePath = ctx.path
    const {query} = ctx

    if (filePath.indexOf('/hmr/') > -1) {
      filePath = filePath.replace('/hmr/', '/')
    }

    const vueFileCode = fs.readFileSync(path.resolve(process.cwd(), filePath.slice(1)), 'utf-8')
    const {descriptor} = compilerSFC.parse(vueFileCode)
    const relativePath = '.' + filePath

    if (!query.type) {
      ctx.type = 'application/javascript'
      ctx.body = `
        ${rewriteModule(descriptor.script.content.replace('export default', 'const __script ='))}
import { render as __render } from "${filePath}?type=template&t=${Date.now()}"
__script.render = __render
__script.__hmrId = "${relativePath}"
__script.__file = "${path.resolve(process.cwd(), filePath.slice(1))}"
export default __script
      `
    } else if (query.type === 'template') {
      const render = compilerDom.compile(descriptor.template.content, {
        mode: 'module'
      }).code
      ctx.type = 'application/javascript'
      ctx.body = rewriteModule(render)
    }

  })

  function handleVueReload (file) {
    file = fileToRequest(file)
    const sendReload = () => {
      watcher.send({
        type: 'vue-reload',
        file: `${file}?t=${Date.now()}`
      })
    }
    sendReload()
  }

  watcher.on('change', (file) => {
    if (file.endsWith('.vue')) {
      handleVueReload(file)
    }
  })
}
