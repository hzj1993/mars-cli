const path = require('path')
const fs = require('fs')
const { parse } = require('es-module-lexer')

const contextModuleRE = /^[./]/;

module.exports = function ({app, watcher}) {
  app.use(async (ctx, next) => {
    if (ctx.path.endsWith('.js')) {
      const code = fs.readFileSync(path.join(process.cwd(), ctx.path.slice(1)), 'utf-8')
      ctx.type = 'application/javascript'
      ctx.status = 200
      ctx.body = rewriteModule(code)
    } else {
      return next()
    }
  })
}

function rewriteModule (code) {
  const importer = parse(code)[0]
  console.log(importer)

  for (let i = 0; i < importer.length; i++) {
    const {s: start, e: end, d: dynamicIndex} = importer[i]
    console.log(start)
    console.log(end)
    console.log(dynamicIndex)
  }
  return code
}