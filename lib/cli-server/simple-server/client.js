window.process = {env: {NODE_ENV: __NODE_ENV__}}
const socketUrl = `ws://${location.hostname}:${__PORT__}`
const socket = new WebSocket(socketUrl, 'hmr')


socket.addEventListener('message', ({ data }) => {
  const payload = JSON.parse(data)
  handleMessage(payload)
})

function handleMessage (payload) {
  const {type, file} = payload

  switch (type) {
    case 'connected':
      console.log('[HMR] connected')
      break
    case 'vue-reload':
      console.log(file)
      import(file).then(m => {        
        __VUE_HMR_RUNTIME__.reload(file, m.default)
        console.log(`[HMR] ${file} template updated`)
      }).catch(err => {
        console.error(err)
      })
      // import(file).then(m => {
      //   console.log(m)
      //   __VUE_HMR_RUNTIME__.reload()
      // })
      break
    case 'vue-rerender':
      import(`${file}?type=template`).then(m => {
        console.log(m)
      })
      break
    case 'full-reload':
      console.log(file)
      window.location.reload()
      break
  }
}
