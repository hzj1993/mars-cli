const fs = require('fs')
const path = require('path')
const {clientPath} = require('./serverClientPlugin')

module.exports = function ({ app, watcher }) {
  app.use(async (ctx, next) => {
    await next()
    if (ctx.path === '/') {
      const html = fs.readFileSync(path.join(process.cwd(), './index.html'), 'utf-8')
      ctx.body = await rewriteHtml(html)
    }
  })
}

function rewriteHtml(html) {
  const hmrClientInjection = `\n  <script type="module">import "${clientPath}"</script>`
  html = html.replace(/<head>/, `$&${hmrClientInjection}`)
  return html
}
