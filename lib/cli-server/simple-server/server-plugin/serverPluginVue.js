const fs = require('fs')
const path = require('path')
const hashSum = require('hash-sum')
const { rewriteModule } = require('./rewriteModulePlugin')
const compilerSFC = require('@vue/compiler-sfc')
const { fileToRequest } = require('../util')
const { codegenCss, postcss } = require('./serverPluginCss')
const LRUCache = require('lru-cache')
const { compileTemplate } = require('@vue/component-compiler-utils')

const componentNormalizerPath = '/vue/normalizeComponent'
const vueCache = new LRUCache({
  max: 65535
})

module.exports = function ({ app, watcher, vueVersion }) {
  app.use(async (ctx, next) => {

    if (ctx.path === componentNormalizerPath) {
      ctx.type = 'js'
      ctx.body = fs.readFileSync(path.join(__dirname, './normalizeComponent.js'))
    }

    if (!ctx.path.endsWith('.vue')) {
      return next()
    }

    let filePath = ctx.path
    const { query } = ctx

    if (filePath.indexOf('/hmr/') > -1) {
      filePath = filePath.replace('/hmr/', '/')
    }

    const absolutePath = path.resolve(process.cwd(), filePath.slice(1))

    const descriptor = await parseSFC(absolutePath)

    // 处理.vue文件script内容
    if (!query.type) {
      const hotReload = !!query.hotreload
      ctx.type = 'js'
      ctx.body = compileSFCMain(descriptor, filePath, absolutePath, vueVersion, hotReload)
    }

    // 处理template标签内容，编译成render函数
    if (query.type === 'template') {
      const { code, errors } = await compileSFCTemplate(descriptor, absolutePath, vueVersion)
      if (errors && errors.length) {
        console.error('SFC template complie error')
        errors.forEach(e => {
          console.error(e)
        })
      }
      ctx.type = 'js'
      ctx.body = rewriteModule(code)
    }

    // 处理style标签内容
    if (query.type === 'style') {
      const index = ctx.query.index
      const id = hashSum(absolutePath)

      const posted = await postcss(descriptor.styles[index])

      const result = await compilerSFC.compileStyleAsync({
        source: posted.css,
        filename: `${absolutePath}?type=style&index=${index}`,
        id: `data-v-${id}`,
        scoped: !!posted.scoped
      })
      ctx.type = 'js'
      ctx.body = codegenCss(`${id}-${index}`, result.code)
    }

  })

  // 生成.vue最终代码
  function compileSFCMain(descriptor, filePath, absolutePath, vueVersion, hotReload) {
    if (vueVersion && vueVersion === 2) {
      return compileSFCMainV2(descriptor, filePath, absolutePath, hotReload)
    }
    return compileSFCMainV3(descriptor, filePath, absolutePath)
  }

  function compileSFCMainV2(descriptor, filePath, absolutePath, hotReload) {
    const id = hashSum(absolutePath)
    const cmpId = `data-v-${id}`
    let code = `${rewriteModule(descriptor.script.content.replace('export default', 'const __script ='))}`

    if (descriptor.template) {
      code += `\nimport { esExports as __esExports } from "${filePath}?type=template&t=${Date.now()}"`
    }

    code += `\nlet __scopeId = null`
    if (descriptor.styles) {
      let hasScoped = false
      descriptor.styles.forEach((style, i) => {
        if (style.scoped) hasScoped = true
        code += `\n\nimport "${filePath}?type=style&index=${i}"`
      })
      if (hasScoped) {
        code += `\n__scopeId = "${id}"`
      }
    }

    code += `\n\nimport normalizeComponent from "${componentNormalizerPath}"`
    code += `\nconst component = normalizeComponent(__script, __esExports.render, __esExports.staticRenderFns, false, null, __scopeId)`

    code += `\n\nconst api = __VUE_HOT_RELOAD_API__`
    code += `\nif (api && api.compatible) {`
      + `\n  if (!api.isRecorded('${cmpId}')) {`
      + `\n    api.createRecord('${cmpId}', component.options)`
      + `\n    console.log("[HOT-RELOAD-API] component ${cmpId} has recorded.")`
      + `\n  }`
      + `\n}`

    code += `\n\nexport default component.${hotReload ? 'options' : 'exports'}`

    return code
  }

  function compileSFCMainV3(descriptor, filePath, absolutePath) {
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

  async function handleVueReload(file, vueVersion) {
    const isVue2 = vueVersion && vueVersion === 2
    const absolutePath = file
    const cached = vueCache.get(absolutePath)
    const prevDescriptor = cached.descriptor

    const descriptor = await parseSFC(absolutePath)

    if (!descriptor || !prevDescriptor) {
      return
    }

    file = fileToRequest(absolutePath)

    const sendReload = (option = {}) => {
      watcher.send(Object.assign({
        type: 'vue-reload',
        file: file,
        fileId: file,
        timestamp: Date.now()
      }, option))
    }

    if (
      !isEqual(prevDescriptor.script, descriptor.script) ||
      !isEqual(prevDescriptor.scriptSetup, descriptor.scriptSetup)
    ) {
      return isVue2 ? sendReload({
        id: `data-v-${hashSum(absolutePath)}`
      }) : sendReload()
    }

    let needRerender = false

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
        timestamp: Date.now(),
        id: `data-v-${hashSum(absolutePath)}`
      })
    }

  }


  watcher.on('change', (file) => {
    if (file.endsWith('.vue')) {
      handleVueReload(file, vueVersion)
    }
  })
}

async function parseSFC(filePath) {
  const vueFileCode = fs.readFileSync(filePath, 'utf-8')

  const { descriptor } = await compilerSFC.parse(vueFileCode)

  vueCache.set(filePath, {
    descriptor,
    styles: []
  })

  return descriptor
}

async function compileSFCTemplate(descriptor, filePath, vueVersion) {
  if (vueVersion && vueVersion === 2) {
    const compiled = compileTemplate({
      source: descriptor.template.content,
      filename: filePath,
      compiler: require('vue-template-compiler'),
      transformAssetUrls: false
    })
    compiled.code += `\nexport const esExports = {render, staticRenderFns}`
    return compiled
  } else {
    const scoped = descriptor.styles.some(s => s.scoped)
    return compilerSFC.compileTemplate({
      source: descriptor.template.content,
      filename: filePath,
      compilerOptions: {
        scopeId: scoped ? `data-v-${hashSum(filePath)}` : null
      }
    })
  }
}

function isEqual(a, b) {
  if (!a && !b) return true
  if (!a || !b) return false
  if (a.src && b.src && a.src === b.src) return true
  if (a.content !== b.content) return false
  const keysA = Object.keys(a.attrs)
  const keysB = Object.keys(b.attrs)
  if (keysA.length !== keysB.length) return false
  return keysA.every(key => a.attrs[key] === b.attrs[key])
}


