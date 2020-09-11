const assert = require('assert');


describe('webpack.base.js test case', () => {
  const baseConfig = require('../../lib/webpack.base')

  it('entry', () => {
    assert.strictEqual(baseConfig.entry.index.indexOf('src/index/index.js') > -1, true);
    assert.strictEqual(baseConfig.entry.hello.indexOf('src/hello/index.js') > -1, true);
  });
})