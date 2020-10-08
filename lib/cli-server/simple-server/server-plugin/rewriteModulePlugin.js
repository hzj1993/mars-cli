const path = require('path')
const fs = require('fs')
var MagicString = require('magic-string')
const { parse } = require('es-module-lexer')
const { isCSSAsset } = require('./serverPluginCss')
const { isStaticAsset } = require('./serverPluginAsset')

const contextModuleRE = /^[./]/;

exports.rewriteModulePlugin = function ({ app, watcher, vueVersion }) {
  app.use(async (ctx, next) => {
    if (ctx.path.endsWith('.js')) {
      const code = fs.readFileSync(path.join(process.cwd(), ctx.path.slice(1)), 'utf-8')
      ctx.type = 'js'
      ctx.status = 200
      ctx.body = rewriteModule(code)
    } else {
      return next()
    }
  })
}

function rewriteModule(code) {
  const importer = parse(code)[0]
  const s = new MagicString(code)

  for (let i = 0; i < importer.length; i++) {
    const { s: start, e: end, d: dynamicIndex } = importer[i]
    if (dynamicIndex === -1) {
      const modulePath = code.substring(start, end)
      const resolved = resolveImport(modulePath)
      s.overwrite(start, end, resolved)
    }
  }
  return s.toString()
}

exports.rewriteModule = rewriteModule

function resolveImport(id) {
  if (!contextModuleRE.test(id)) {
    return `/@module/${id}`
  } else {
    if (isCSSAsset(id) || isStaticAsset(id)) {
      return `${id}?import`
    }
    return id
  }
}
