const argv = require('minimist')(process.argv.slice(2))
const SimpleServer = require('./simple-server/index')

module.exports = cmd => {
  const simpleMode = argv.simple

  if (simpleMode) {
    const server = new SimpleServer({
        port: 3000
    })
    server.run()
  } else {
    runWDS()
  }
}

function runWDS () {}
