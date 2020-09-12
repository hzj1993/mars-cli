const path = require('path')

process.chdir(path.join(__dirname, 'template'))

describe('builder-webpack test case', () => {
  require('./unit/webpack-base-test');
})