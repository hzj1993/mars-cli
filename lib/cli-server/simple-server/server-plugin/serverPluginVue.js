const fs = require('fs')
const path = require('path')
const hashSum = require('hash-sum')
const {rewriteModule} = require('./rewriteModulePlugin')
const compilerSFC = require('@vue/compiler-sfc')
const {fileToRequest} = require('../util')
const {codegenCss} = require('./serverPluginCss')
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

    // 处理.vue文件script内容
    if (!query.type) {
      ctx.type = 'js'
      ctx.body = compileSFCMain(descriptor, filePath, absolutePath)
    }
    
    // 处理template标签内容，编译成render函数
    if (query.type === 'template') {
      const scoped = descriptor.styles.some(s => s.scoped)
      const {code, errors} = compilerSFC.compileTemplate({
        source: descriptor.template.content,
        filename: absolutePath,
        compilerOptions: {
          scopeId: scoped ? `data-v-${hashSum(absolutePath)}` : null
        }
      })
      if (errors.length) {
        console.error('SFC template complie error')
        errors.forEach(e => {
          console.error(e)
        })
      }
      ctx.type = 'js'
      ctx.body = rewriteModule(code)
    } 
    
    // 处理style标签内容
    // TODO: 增加预处理器
    if (query.type === 'style') {
      const index = ctx.query.index
      const id = hashSum(absolutePath)
      // console.log(id)
      const styleBlock = descriptor.styles[index]
      const result = await compilerSFC.compileStyleAsync({
        source: styleBlock.content,
        filename: `${absolutePath}?type=style&index=${index}`,
        id: `data-v-${id}`,
        scoped: !!styleBlock.scoped
      })
      // // console.log(result)
      ctx.type = 'js'
      // ctx.body = '123'
      ctx.body = codegenCss(`${id}-${index}`, result.code)
    }

  })

  // 生成.vue最终代码
  function compileSFCMain (descriptor, filePath, absolutePath) {
    const id = hashSum(absolutePath)
    const relativePath = '.' + filePath
    let code = ''
    code += `${rewriteModule(descriptor.script.content.replace('export default', 'const __script ='))}\n`

    if (descriptor.styles) {
      let hasScoped = false
      descriptor.styles.forEach((style, i) => {
        if (style.scoped) hasScoped = true
        code += `import "${filePath}?type=style&index=${i}"\n`
      })
      if (hasScoped) {
        code += `__script.__scopeId = "data-v-${id}"\n`
      }
    }

    if (descriptor.template) {
      code += `import { render as __render } from "${filePath}?type=template&t=${Date.now()}"\n`
      code += `__script.render = __render\n`
    }
    
    code += `__script.__hmrId = "${relativePath}"\n`
    code += `__script.__file = "${absolutePath}"\n`
    code += `export default __script\n`

    return code
  }

  async function handleVueReload (file) {
    const absolutePath = file
    const cached = vueCache.get(absolutePath)
    const prevDescriptor = cached.descriptor

    const descriptor = await parseSFC(absolutePath)

    if (!descriptor || !prevDescriptor) {
      return
    }

    file = fileToRequest(absolutePath)

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
      return sendReload()
    }

    if (!isEqual(prevDescriptor.template, descriptor.template)) {
      needRerender = true
    }

    const styleId = hashSum(absolutePath)
    const prevStyles = prevDescriptor.styles || []
    const nextStyles = descriptor.styles || []

    nextStyles.forEach((style, index) => {
      if (!prevStyles[index] || !isEqual(prevStyles[index], style)) {
        watcher.send({
          type: 'style-update',
          file: `${file}?type=style&index=${index}`,
          timestamp: Date.now()
        })
      }
    })

    prevStyles.slice(nextStyles.length).forEach((_, i) => {
      watcher.send({
        type: 'style-remove',
        id: `${styleId}-${i + nextStyles.length}`
      })
    })

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