const Koa = require('koa')
const http = require('http')
const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')
const rewriteHtmlPlugin = require('./server-plugin/rewriteHtmlPlugin')
const {serverClientPlugin} = require('./server-plugin/serverClientPlugin')
const serverHmrPlugin = require('./server-plugin/serverHmrPlugin')
const {rewriteModulePlugin} = require('./server-plugin/rewriteModulePlugin')
const resolvedModulePlugin = require('./server-plugin/resolvedModulePlugin')
const serverPluginVue = require('./server-plugin/serverPluginVue')
const {serverPluginCss} = require('./server-plugin/serverPluginCss')
const {serverPluginAsset} = require('./server-plugin/serverPluginAsset')
const {serverPluginStatic} = require('./server-plugin/serverPluginStatic')
const {serverPluginProxy} = require('./server-plugin/serverPluginProxy')

const {logger} = require('../../util/index')

const root = process.cwd()

module.exports = class SimpleServer {
    constructor(options) {
        const { port, vueVersion } = options
        const userConfig = path.join(process.cwd(), 'none.config.js')
        if (fs.existsSync(userConfig)) {
            const {dev} = require(userConfig)
            this.config = dev || {}
        }
        this.port = port || 3000
        this.vueVersion = vueVersion
        this.watcher = chokidar.watch(root, {
            ignored: [/\bnode_modules\b/, /\b\.git\b/],
            awaitWriteFinish: {
                stabilityThreshold: 100,
                pollInterval: 10
            }
        })
        this.plugins = [
            rewriteHtmlPlugin,
            rewriteModulePlugin,
            resolvedModulePlugin,
            serverPluginProxy,
            serverClientPlugin,
            serverHmrPlugin,
            serverPluginVue,
            serverPluginCss,
            serverPluginAsset,
            serverPluginStatic
        ]
        this.app = new Koa()
        this.server = http.createServer(this.app.callback())
        this.init()
    }

    init() {
        for (const plugin of this.plugins) {
            plugin.call(this, this)
        }
    }

    run() {
        this.server.on('error', e => {
            if (e.code === 'EADDRINUSE') {
                console.log(`Port ${this.port} is in use, try another`)
                setTimeout(() => {
                    this.server.close()
                }, 100)
            } else {
                console.error('Server error')
                console.error(e)
            }
        })
        this.server.listen(this.port, () => {
            logger.log(`[None-cli] app is listening port ${this.port}`)
        })
    }
}
