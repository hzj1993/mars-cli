const { logger } = require('../util/index')
const Koa = require('koa')
const chokidar = require('chokidar')
const app = new Koa()

module.exports = cmd => {
  logger.normal('None-cli start local server')
  const root = process.cwd()
  const watcher = chokidar.watch(root, {
    ignored: [/\bnode_modules\b/, /\b\.git\b/, /\b\.idea\b/]
  })

  app.use((ctx, next) => {

  })
}
