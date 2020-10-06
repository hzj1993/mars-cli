const fs = require('fs')
const path = require('path')
const hashSum = require('hash-sum')
const chalk = require('chalk')
const { isImportRequest, fileToRequest } = require('../util')

const { clientPath } = require('./serverClientPlugin')


const cssExternalRE = /\.(less|sass|scss)$/

function serverPluginCss({ app, watcher }) {
  app.use(async (ctx, next) => {

    await next()

    if (isCSSAsset(ctx.path) && isImportRequest(ctx)) {
      let filePath = ctx.path
      if (filePath.indexOf('/hmr/') > -1) {
        filePath = filePath.replace('/hmr/', '/')
      }
      const id = hashSum(filePath)
      const css = processCss(filePath)
      ctx.type = 'js'
      ctx.body = codegenCss(id, css)
    }
  })

  watcher.on('change', file => {
    if (isCSSAsset(file)) {
      const filePath = fileToRequest(file)
      watcher.send({
        type: 'style-update',
        file: filePath,
        timestamp: Date.now()
      })
    }
  })

  function processCss(filePath) {
    const finalPath = path.resolve(process.cwd(), filePath.slice(1))
    const code = fs.readFileSync(finalPath, 'utf-8')
    let lang = 'css'
    if (!filePath.endsWith('.css')) {
      const match = filePath.match(cssExternalRE)
      if (match) lang = match[1]
    }
    const {css} = transformCss(code, lang)

    return css
  }
}

function codegenCss(id, source) {
  const code =
    `import { updateStyle } from "${clientPath}"\n` +
    `const css = ${JSON.stringify(source)}\n` +
    `updateStyle(${JSON.stringify(id)}, css)\n` +
    `export default css`

  return code
}

function isCSSAsset(file) {
  return file.endsWith('.css') || cssExternalRE.test(file)
}

// TODO: 待完善增加预处理器，以及插件处理机制，目前仅支持less
async function transformCss (source, lang) {
  if (!lang || lang === 'css') return source
  let result = {}
  if (lang === 'less') {
    // TODO less未支持依赖文件加载
    const less = require('less')
    try {
      result = await less.render(source)
    } catch (error) {
      console.error(chalk.red(error))
    } 
  }
  return result
}

async function postcss (styleBlock) {
  const {content, lang, scoped} = styleBlock
  if (!lang) {
    return { css: content, lang, scoped }
  }
  const result = await transformCss(content, lang)

  const {css, imports} = result

  return { css, lang, scoped }
}

module.exports = {
  serverPluginCss,
  isCSSAsset,
  codegenCss,
  postcss,
  transformCss
}