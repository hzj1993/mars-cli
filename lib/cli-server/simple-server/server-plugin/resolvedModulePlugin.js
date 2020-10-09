const path = require('path')
const fs = require('fs')
const hashSum = require('hash-sum')
const { rewriteModule } = require('./rewriteModulePlugin')
const { isStaticAsset } = require('./serverPluginAsset')
const { isCSSAsset, codegenCss, processCss } = require('./serverPluginCss')
const { isImportRequest } = require('../util')
const thirdPartModuleRE = /^\/@module\//

// 使用内存存储已读取过的模块代码，提升二次读取时的速度
const moduleCache = new Map()
const fileCache = new Map()

module.exports = function ({ app, config }) {
  app.use(async (ctx, next) => {
    if (thirdPartModuleRE.test(ctx.path)) {
      if (moduleCache.has(ctx.path)) {
        ctx.type = 'application/javascript'
        ctx.body = rewriteModule(moduleCache.get(ctx.path), config)
      } else {
        if (isCSSAsset(ctx.path)) {
          const id = hashSum(ctx.path)
          const css = await processCss(ctx.path)

          ctx.type = 'js'
          ctx.body = codegenCss(id, css)
        } else {
          const prefix = path.resolve(process.cwd(), 'node_modules', ctx.path.replace(thirdPartModuleRE, ''))
          if (fs.existsSync(prefix)) {
            const stat = fs.statSync(prefix)
            if (stat.isDirectory()) {
              const { module, main } = require(path.join(prefix, 'package.json'))
              let moduleCode
              if (module) {
                moduleCode = fs.readFileSync(path.join(prefix, module), 'utf-8')
              } else if (main) {
                moduleCode = fs.readFileSync(path.join(prefix, main), 'utf-8')
              }

              moduleCache.set(ctx.path, moduleCode)

              ctx.type = 'js'
              ctx.body = rewriteModule(moduleCode, config)
            } else if (stat.isFile()) {
              const moduleCode = fs.readFileSync(prefix, 'utf-8')

              moduleCache.set(ctx.path, moduleCode)

              ctx.type = 'js'
              ctx.body = rewriteModule(moduleCode, config)
            }
          }

        }
      }
    } else if (
      !isStaticAsset(ctx.path) &&
      !isCSSAsset(ctx.path) &&
      !ctx.path.endsWith('.vue') &&
      isImportRequest(ctx)
    ) {
      const filePath = path.join(process.cwd(), ctx.path.slice(1))

      if (fileCache.has(filePath)) {
        const code = fs.readFileSync(fileCache.get(filePath), 'utf-8')
        ctx.status = 200
        ctx.type = 'js'
        ctx.body = rewriteModule(code, config)
        return next()
      }

      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath)
        if (stat.isDirectory()) {
          const finalPath = path.join(filePath, 'index.js')
          if (fs.existsSync(finalPath)) {
            fileCache.set(filePath, finalPath)
            const code = fs.readFileSync(fileCache.get(filePath), 'utf-8')
            ctx.status = 200
            ctx.type = 'js'
            ctx.body = rewriteModule(code, config)
          }
        }
      } else if (fs.existsSync(`${filePath}.js`)) {
        fileCache.set(filePath, `${filePath}.js`)
        const code = fs.readFileSync(fileCache.get(filePath), 'utf-8')
        ctx.status = 200
        ctx.type = 'js'
        ctx.body = rewriteModule(code, config)
      }
    } else {
      return next()
    }
  })
}