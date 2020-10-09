const fs = require('fs')
const path = require('path')
const { clientPath } = require('./serverClientPlugin')

module.exports = function ({ app, watcher, vueVersion }) {
  app.use(async (ctx, next) => {
    await next()
    if (ctx.path === '/') {
      const htmlPath = path.join(process.cwd(), './index.html')
      let html = ''
      if (fs.existsSync(htmlPath)) {
        html = fs.readFileSync(htmlPath, 'utf-8')
      } else {
        html = fs.readFileSync(path.join(process.cwd(), './public/index.html'), 'utf-8')
      }

      ctx.body = await rewriteHtml(html, vueVersion)
    }
  })

  watcher.on('change', file => {
    if (file.endsWith('.html')) {
      watcher.send({
        type: 'full-reload',
        file
      })
    }
  })
}

function rewriteHtml(html, vueVersion) {
  let hmrClientInjection = `\n  <script type="module">import "${clientPath}"</script>`

  if (vueVersion && vueVersion === 2) {
    const initVueInjection = `\n  <script type="module" src="./src/main.js"></script>`
    html = html.replace(/<\/body>/, `$&${initVueInjection}`)

    hmrClientInjection =
      `\n    <script type="module">` +
      `\n      import "${clientPath}"` +
      `\n      import Vue from "/@module/vue"` +
      `\n      __VUE_HOT_RELOAD_API__.install(Vue)` +
      `\n    </script>`
  }

  html = html.replace(/<head>/, `$&${hmrClientInjection}`)

  return html
}
