module.exports = {
  dev: {
    proxy: {
      '/api/v1/': {
        // target: 'http://10.5.68.61:5000/',
        // target: 'http://200.200.90.34:8080',
        // target: 'http://172.24.0.14:5000',
        // target: 'http://172.24.0.14:5002', // 席一鸿
        target: 'http://200.200.4.47:5002',
        // target: 'http://10.154.106.103:5002',
        // target: 'http://172.21.0.14:5002',
        // target: 'http://10.154.106.124:5002',
        ws: false,
        changeOrigin: true
      }
    }
  }
}