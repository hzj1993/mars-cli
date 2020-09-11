const {promisify} = require('util')
const figlet = promisify(require('figlet'))
const clear = require('clear')
const chalk = require('chalk')
const log = contect => console.log(chalk.green(contect))

const {clone} = require('./download')
const open = require('open')

const spawn = async (...args) => {
  const {spawn} = require('child_process')
  return new Promise(resolve => {
    const proc = spawn(...args)
    proc.stdout.pipe(process.stdout)
    proc.stderr.pipe(process.stderr)
    proc.on('close', () => {
      resolve()
    })
  })
}
module.exports = async name => {
  clear()
  const welcomeText = await figlet('Mars Welcome')
  log(welcomeText)

  // clone
  log(`✈ Create project: ${name}`)
  await clone('github:xxxxxxx/xxxx', name)

  // 安装依赖
  log('Installing dependencies ...')
  await spawn('npm', ['install'], {cwd: `./${name}`})
  log('✔ Install dependencies done')

  // 启动服务
  log('Start run serve')
  open('http://localhost:8080')
  await spawn('npm', ['run', 'serve'], {cwd: `./${name}`})
}