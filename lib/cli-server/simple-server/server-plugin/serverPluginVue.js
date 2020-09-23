const fs = require('fs')
const path = require('path')
const {rewriteModule} = require('./rewriteModulePlugin')
const compilerSFC = require('@vue/compiler-sfc')
const compilerDom = require('@vue/compiler-dom')

module.exports = function ({ app, watcher }) {
  app.use(async (ctx, next) => {
    if (!ctx.path.endsWith('.vue')) {
      return next()
    }

    const filePath = ctx.path
    const {query} = ctx

    const vueFileCode = fs.readFileSync(path.resolve(process.cwd(), filePath.slice(1)), 'utf-8')
    const {descriptor} = compilerSFC.parse(vueFileCode)

    if (!query.type) {
      ctx.type = 'application/javascript'
      ctx.body = `
        ${rewriteModule(descriptor.script.content.replace('export default', 'const __script ='))}
import { render as __render } from "${filePath}?type=template&t=${Date.now()}"
__script.render = __render
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
}

