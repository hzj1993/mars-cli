const WebSocket = require('ws')

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
    console.log('connect')
    socket.send(JSON.stringify({ type: 'connected' }))
  })

  wss.on('error', e => {
    console.error('WebSocket server error')
    console.error(e)
  })
}