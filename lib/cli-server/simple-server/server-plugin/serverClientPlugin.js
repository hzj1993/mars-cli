const fs = require('fs')
const path = require('path')
const clientPath = '/hmr/client'
const clientHotReloadPath = '/hmr/hotReload'

exports.clientPath = clientPath
exports.clientHotReloadPath = clientHotReloadPath

exports.serverClientPlugin = function ({ app, watcher, vueVersion }) {
  app.use(async (ctx, next) => {
    if (ctx.path === clientPath) {
      ctx.type = 'js'
      ctx.status = 200
      ctx.body = readClientCode(this)
    } else if (ctx.path === clientHotReloadPath) {
      ctx.type = 'js'
      ctx.status = 200
      ctx.body = readHotReloadCode(this)
    } else {
      return next()
    }
  })
}

function readClientCode(server) {
  let source = fs.readFileSync(path.join(__dirname, '../client.js'), 'utf-8')
  const vueVersion = server.vueVersion ? server.vueVersion : 3
  source = source
    .replace(`__PORT__`, server.port)
    .replace(`__NODE_ENV__`, JSON.stringify('development'))
    .replace(`__VUE_VERSION__`, vueVersion)

  if (vueVersion === 2) {
    const injectCode = `import vueHotReloadApi from "${clientHotReloadPath}"`
      + `\nwindow.__VUE_HOT_RELOAD_API__ = vueHotReloadApi`

    source = source.replace(`__VUE2_INJECTION__`, injectCode)
  } else {
    source = source.replace(`__VUE2_INJECTION__`, '')
  }

  return source
}

function readHotReloadCode(server) {
  const hotReloadPath = path.resolve(__dirname, '../../../../node_modules/vue-hot-reload-api/dist/index.js')
  const hotReloadCode = fs.readFileSync(hotReloadPath, 'utf-8')

  return `var exports = {}`
    + `\n${hotReloadCode}`
    + `\nvar vueHotReloadApi = exports`
    + `\nexport default vueHotReloadApi`
}
