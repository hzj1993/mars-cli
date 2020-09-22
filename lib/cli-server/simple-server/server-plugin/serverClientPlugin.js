const fs = require('fs')
const path = require('path')
const clientPath = '/hmr/client'

exports.clientPath = clientPath

exports.serverClientPlugin = function ({ app, watcher }) {
  app.use(async (ctx, next) => {
    if (ctx.path === clientPath) {
      ctx.type = 'application/javascript'
      ctx.status = 200
      ctx.body = readClientCode(this)
    } else {
      return next()
    }
  })
}

function readClientCode (server) {
  let source = fs.readFileSync(path.join(__dirname, '../client.js'), 'utf-8')
  source = source.replace(`__PORT__`, server.port)
  return source
}