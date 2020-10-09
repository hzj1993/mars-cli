const serve = require('koa-static')

exports.serverPluginStatic = function ({ app, watcher }) {
  // app.use(async (ctx, next) => {
  //   if (ctx.body || ctx.status !== 404) {
  //     return
  //   }
  // })
  app.use(serve('.'))
}
