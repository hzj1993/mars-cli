const fs = require('fs')
const path = require('path')
const {rewriteModule} = require('./rewriteModulePlugin')
const compilerSFC = require('@vue/compiler-sfc')
const compilerDom = require('@vue/compiler-dom')
const {fileToRequest} = require('../util')
const isWin = require('os').platform() === 'win32'
const pathSeparator = isWin ? '\\' : '/'
const LRUCache = require('lru-cache')

const vueCache = new LRUCache({
  max: 65535
})

module.exports = function ({ app, watcher }) {
  app.use(async (ctx, next) => {
    if (!ctx.path.endsWith('.vue')) {
      return next()
    }

    let filePath = ctx.path
    const {query} = ctx

    if (filePath.indexOf('/hmr/') > -1) {
      filePath = filePath.replace('/hmr/', '/')
    }

    const absolutePath = path.resolve(process.cwd(), filePath.slice(1))

    const descriptor = await parseSFC(absolutePath)

    const relativePath = '.' + filePath

    if (!query.type) {
      ctx.type = 'application/javascript'
      ctx.body = `
        ${rewriteModule(descriptor.script.content.replace('export default', 'const __script ='))}
import { render as __render } from "${filePath}?type=template&t=${Date.now()}"
__script.render = __render
__script.__hmrId = "${relativePath}"
__script.__file = "${absolutePath}"
export default __script
      `
    } else if (query.type === 'template') {
      const render = compilerDom.compile(descriptor.template.content, {
        mode: 'module'
      }).code
      ctx.type = 'application/javascript'
      ctx.body = rewriteModule(render)
    }

  })

  async function handleVueReload (file) {
    const cached = vueCache.get(file)
    const prevDescriptor = cached.descriptor

    const descriptor = await parseSFC(file)

    if (!descriptor || !prevDescriptor) {
      return
    }

    console.log(descriptor)

    file = fileToRequest(file)
    const sendReload = () => {
      watcher.send({
        type: 'vue-reload',
        file: file,
        fileId: file,
        timestamp: Date.now()
      })
    }

    if (
      !isEqual(prevDescriptor.script, descriptor.script) ||
      !isEqual(prevDescriptor.scriptSetup, descriptor.scriptSetup)
    ) {
      sendReload()
    }

    if (!isEqual(prevDescriptor.template, descriptor.template)) {
      needRerender = true
    }

    if (needRerender) {
      watcher.send({
        type: 'vue-rerender',
        file: file,
        fileId: file,
        timestamp: Date.now()
      })
    }

  }

  let needRerender = false

  watcher.on('change', (file) => {
    if (file.endsWith('.vue')) {
      handleVueReload(file)
    }
  })
}

function fileToRequest (file) {
  file = path.relative(process.cwd(), file).replace(/\\/g, '/')
  if (file[0] !== '.') {
    if (file[0] === '/') {
      file = '.' + file
    } else {
      file = './' + file
    }
  }
  return file
}

async function parseSFC (filePath) {
  const vueFileCode = fs.readFileSync(filePath, 'utf-8')

  const {descriptor} = await compilerSFC.parse(vueFileCode)

  vueCache.set(filePath, {
    descriptor,
    styles: []
  })

  return descriptor
}

function isEqual (a, b) {
  if (!a && !b) return true
  if (!a || !b) return false
  if (a.src && b.src && a.src === b.src) return true
  if (a.content !== b.content) return false
  const keysA = Object.keys(a.attrs)
  const keysB = Object.keys(b.attrs)
  if (keysA.length !== keysB.length) return false
  return keysA.every(key => a.attrs[key] === b.attrs[key])
}