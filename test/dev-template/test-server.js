const SimpleServer = require('../../lib/cli-server/simple-server/index')

const app = new SimpleServer({
    port: 3000,
    // vueVersion: 2
})

app.run()