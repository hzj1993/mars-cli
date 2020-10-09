const proxy = require('koa-proxies')
const {logger} = require('../../../util')

exports.serverPluginProxy = function ({ app, config }) {
  if (!config.dev || !config.dev.proxy) return

  const options = config.dev.proxy
  Object.keys(options).forEach(key => {
    let opt = options[key]
    if (typeof opt === 'string') {
      opt = {
        target: opt
      }
    }
    opt.logs = (ctx, target) => {
      logger.log(`${ctx.req.method} ${ctx.req.oldPath} proxy to -> ${new URL(ctx.req.url, target)}`)
    }
    app.use(proxy(key, opt))
  })
}
