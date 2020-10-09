const path = require('path')
const fs = require('fs')
var MagicString = require('magic-string')
const { parse } = require('es-module-lexer')
const { isCSSAsset } = require('./serverPluginCss')
const { isStaticAsset } = require('./serverPluginAsset')

const contextModuleRE = /^[./]/;

exports.rewriteModulePlugin = function ({ app, watcher, vueVersion, config }) {
  app.use(async (ctx, next) => {
    if (ctx.path.endsWith('.js')) {
      const code = fs.readFileSync(path.join(process.cwd(), ctx.path.slice(1)), 'utf-8')
      ctx.type = 'js'
      ctx.status = 200
      ctx.body = rewriteModule(code, config)
    } else {
      return next()
    }
  })

}

function rewriteModule(code, config = null) {
  if (!code) return ''
  const importer = parse(code)[0]
  const s = new MagicString(code)

  for (let i = 0; i < importer.length; i++) {
    const { s: start, e: end, d: dynamicIndex } = importer[i]
    if (dynamicIndex === -1) {
      const modulePath = code.substring(start, end)
      const resolved = resolveImport(modulePath, config)
      s.overwrite(start, end, resolved)
    }
  }
  return s.toString()
}

exports.rewriteModule = rewriteModule

function resolveImport(id, config = null) {
  if (!config) {
    if (!contextModuleRE.test(id)) {
      return `/@module/${id}`
    } else {
      if (isCSSAsset(id) || isStaticAsset(id)) {
        return `${id}?import`
      } 
      return id
    }
  }

  const { reg, alias, aliasLength } = getAlias(config)
  const match = id.match(reg)

  if (!contextModuleRE.test(id)) {
    return match ? `${id.replace(reg, `/${alias[match[1]]}/`)}?import` : `/@module/${id}`
  } else {
    if (isCSSAsset(id) || isStaticAsset(id)) {
      return match ? `${id.replace(reg, `/${alias[match[1]]}/`)}?import` : `${id}?import`
    } else if (id.endsWith('.vue')) {
      return match ? id.replace(reg, `/${alias[match[1]]}/`) : id
    }
    return match ? `${id.replace(reg, `/${alias[match[1]]}/`)}?import` : `${id}?import`
  }
}


function getAlias(config) {
  const { alias } = config
  let reg
  if (alias && typeof alias === 'object') {
    reg = new RegExp(`\/?(${Object.keys(alias).join('|')})\/`)
  }
  return { reg, alias, aliasLength: Object.keys(alias).length }
}