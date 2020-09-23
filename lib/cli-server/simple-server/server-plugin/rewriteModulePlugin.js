const path = require('path')
const fs = require('fs')
var MagicString = require( 'magic-string' )
const { parse } = require('es-module-lexer')

const contextModuleRE = /^[./]/;

exports.rewriteModulePlugin = function ({app, watcher}) {
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
  const s = new MagicString(code)

  for (let i = 0; i < importer.length; i++) {
    const {s: start, e: end, d: dynamicIndex} = importer[i]
    if (dynamicIndex === -1) {
      const modulePath = code.substring(start, end)
      const resolved = resolveImport(modulePath)
      if (/@module/.test(resolved)) {
        s.overwrite(start, end, resolved)
      }
    }
  }
  return s.toString()
}

exports.rewriteModule = rewriteModule

function resolveImport(id) {
  if (!contextModuleRE.test(id)) {
    return `/@module/${id}`
  } else {
    return id
  }
}

function replaceString(source, dest, start, end) {
  return `${source.slice(0, start)}${dest}${source.slice(end)}`
} 