const path = require('path')
const fs = require('fs')
const { rewriteModule } = require('./rewriteModulePlugin')
const thirdPartModuleRE = /^\/@module\//

// 使用内存存储已读取过的模块代码，提升二次读取时的速度
const moduleCache = new Map()

module.exports = function ({ app }) {
  app.use(async (ctx, next) => {
    if (thirdPartModuleRE.test(ctx.path)) {
      if (moduleCache.has(ctx.path)) {
        ctx.type = 'application/javascript'
        ctx.body = rewriteModule(moduleCache.get(ctx.path))
      } else {
        const prefix = path.resolve(process.cwd(), 'node_modules', ctx.path.replace(thirdPartModuleRE, ''))
        const { module } = require(path.join(prefix, 'package.json'))
        const moduleCode = fs.readFileSync(path.join(prefix, module), 'utf-8')

        moduleCache.set(ctx.path, moduleCode)

        ctx.type = 'application/javascript'
        ctx.body = rewriteModule(moduleCode)
      }
    } else {
      return next()
    }
  })
}