const path = require('path')

function isImportRequest (ctx) {
  return ctx.query.import !== null && ctx.query.import !== undefined
}
function fileToRequest (file) {
  file = path.relative(process.cwd(), file).replace(/\\/g, '/')
  if (file[0] !== '.') {
    if (file[0] === '/') {
      file = '.' + file
    } else {
      file = './' + file
    }
  }
  return file
}
module.exports = {
  fileToRequest,
  isImportRequest
}