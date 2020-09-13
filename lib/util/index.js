const chalk = require('chalk')

exports.spawn = async (...args) => {
  const { spawn } = require('child_process')
  return new Promise(resolve => {
    if (args[0] === 'npm') {
      args[0] = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    }
    const proc = spawn(...args)
    proc.stdout.pipe(process.stdout)
    proc.stderr.pipe(process.stderr)
    proc.on('close', () => {
      resolve()
    })
  })
}

exports.logger = {
  log (content) {
    console.log()
    console.log(chalk.green(content))
    console.log()
  },
  error (err) {
    console.log()
    console.log(`${chalk.bgRed(' ERROR ')} ${chalk.red(err)}`)
    console.log()
  },
  warn (content) {
    console.log()
    console.log(chalk.yellow(content))
    console.log()
  },
  normal (...args) {
    console.log(...args)
  }
}
