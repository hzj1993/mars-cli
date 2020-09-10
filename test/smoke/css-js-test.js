const glob = require('glob-all');

describe('Checking generated css js files', () => {
    it('should generate css js files', (done) => {
        const files = glob.sync([
            './dist/index_*.js',
            './dist/index_*.css',
            './dist/hello_*.js',
            './dist/hello_*.css',
        ])
        if (files.length) {
            done();
        } else {
            throw new Error('no css js files generate');
        }
    });
})