window.process = {env: {NODE_ENV: __NODE_ENV__}}
const socketUrl = `ws://${location.hostname}:${__PORT__}`
const socket = new WebSocket(socketUrl, 'hmr')


socket.addEventListener('message', ({ data }) => {
  const payload = JSON.parse(data)
  handleMessage(payload)
})

function handleMessage (payload) {
  const {type, file, fileId, timestamp} = payload

  switch (type) {
    case 'connected':
      console.log('[HMR] connected')
      break
    case 'vue-reload':
      import(`${file}?t=${timestamp}`).then(m => {
        __VUE_HMR_RUNTIME__.reload(fileId, m.default)
        console.log(`[HMR] ${fileId} updated`)
      }).catch(err => {
        console.error(err)
      })
      // import(file).then(m => {
      //   console.log(m)
      //   __VUE_HMR_RUNTIME__.reload()
      // })
      break
    case 'vue-rerender':
      import(`${file}?type=template&t=${timestamp}`).then(m => {
        __VUE_HMR_RUNTIME__.rerender(file, m.render)
        console.log(`[HMR] ${fileId} template updated`)
      })
      break
    case 'full-reload':
      console.log(file)
      window.location.reload()
      break
  }
}
