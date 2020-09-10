const glob = require('glob-all');

describe('Checking generated html files', () => {
    it('should generate html files', (done) => {

        const files = glob.sync([
            './dist/index.html',
            './dist/hello.html'
        ])
        if (files.length) {
            done();
        } else {
            throw new Error('no html files generate');
        }
    });
})