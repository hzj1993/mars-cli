const WebSocket = require('ws')
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
}