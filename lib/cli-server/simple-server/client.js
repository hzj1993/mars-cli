window.process = {env: {NODE_ENV: __NODE_ENV__}}
const socketUrl = `ws://${location.hostname}:${__PORT__}`
const socket = new WebSocket(socketUrl, 'hmr')


socket.addEventListener('message', ({ data }) => {
  const payload = JSON.parse(data)
  handleMessage(payload)
})

async function handleMessage (payload) {
  const {type, file, fileId, timestamp, id} = payload

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
    case 'style-update':
      const el = document.querySelector(`link[href*='${file}']`)
      if (el) {
        el.setAttribute('href', `${file}${file.includes('?') ? '&' : '?'}t=${timestamp}`)
        break
      }
      const queryString = file.includes('?') ? '&import' : '?import'
      await import(`${file}${queryString}&t=${timestamp}`)
      console.log(`[HMR] ${file} updated`)
      break
    case 'style-remove':
      removeStyle(id)
      break
    case 'full-reload':
      console.log(file)
      window.location.reload()
      break
  }
}

// 判断支持construct-stylesheets
const supportConstructedSheet = (() => {
  try {
    new CSSStyleSheet()
    return true
  } catch (error) {}
  return false
})()

const sheetsMap = new Map()

export function updateStyle (id, css) {
  let style = sheetsMap.get(id)
  if (supportConstructedSheet) {
    if (style && !(style instanceof CSSStyleSheet)) {
      removeStyle(id)
      style = undefined
    }

    if (!style) {
      style = new CSSStyleSheet()
      style.replaceSync(css)
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, style]
    } else {
      style.replaceSync(css)
    }
  } else {
    if (style && !(style instanceof HTMLStyleElement)) {
      removeStyle(id)
      style = undefined
    }

    if (!style) {
      style = document.createElement('style')
      style.setAttribute('type', 'text/css')
      style.innerHTML = css
      document.head.appendChild(style)
    } else {
      style.innerHTML = css
    }
  }
  sheetsMap.set(id, style)
}

function removeStyle (id) {
  const style = sheetsMap.get(id)
  if (style) {
    if (style instanceof CSSStyleSheet) {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        s => s !== style
      )
    } else {
      document.head.removeChild(style)
    }
    sheetsMap.delete(id)
  }
}