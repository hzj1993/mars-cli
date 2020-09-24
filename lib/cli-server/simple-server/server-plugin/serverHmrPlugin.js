const WebSocket = require('ws')
const chalk = require('chalk')
const { logger } = require('../../../util/index')

module.exports = function ({app, watcher, server}) {
  const wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    if (req.headers['sec-websocket-protocol'] === 'hmr') {
      wss.handleUpgrade(req, socket, head, ws => {
        wss.emit('connection', ws, req)
      })
    }
  })

  wss.on('connection', (socket) => {
    logger.log('[HMR] WebSocket connect success')
    socket.send(JSON.stringify({ type: 'connected' }))
  })

  wss.on('error', e => {
    console.error('[HMR] WebSocket server error')
    console.error(e)
  })

  const send = (watcher.send = (data) => {
    data = JSON.stringify(data)
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    })
  }) 

  function isCSSAssets(file) {
    const assetsRE = /\.(css|less|sass|scss)$/
    return assetsRE.test(file)
  }
  
  function handleJSReload (file) {
    file = file.replace(process.cwd(), '')
    send({
      type: 'full-reload',
      file
    })
  }

  watcher.on('change', (path, stats) => {
    if (!(path.endsWith('.vue') || isCSSAssets(path))) {
      logger.log(`[HMR] File ${chalk.blue(path)} changed!`)
      handleJSReload(path)
    }
  });
}

