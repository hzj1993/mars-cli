window.process = {env: {NODE_ENV: __NODE_ENV__}}
const socketUrl = `ws://${location.hostname}:${__PORT__}`
const socket = new WebSocket(socketUrl, 'hmr')

socket.addEventListener('message', ({ data }) => {
  const payload = JSON.parse(data)
  handleMessage(payload)
  console.log(data)
})

function handleMessage (payload) {

}
