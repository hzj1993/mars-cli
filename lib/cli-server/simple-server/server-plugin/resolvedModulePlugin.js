const path = require('path')
const fs = require('fs')
const {rewriteModule} = require('./rewriteModulePlugin')
const thirdPartModuleRE = /^\/@module\//

module.exports = function ({app}) {
  app.use(async (ctx, next) => {
    if (thirdPartModuleRE.test(ctx.path)) {
      const prefix = path.resolve(process.cwd(), 'node_modules', ctx.path.replace(thirdPartModuleRE, ''))
      const {module} = require(path.join(prefix, 'package.json'))
      const moduleCode = fs.readFileSync(path.join(prefix, module), 'utf-8')
      ctx.type = 'application/javascript'
      ctx.body = rewriteModule(moduleCode)
    } else {
      return next()
    }
  })
}