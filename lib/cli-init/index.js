// const { promisify } = require('util')
// const figlet = promisify(require('figlet'))
const clear = require('clear')
const chalk = require('chalk')
const open = require('open')
const log = contect => console.log(chalk.green(contect))

const { clone } = require('./download')
const { spawn } = require('../util/index')

module.exports = async name => {
  clear()

  // clone
  log(`Create project: ${name}`)
  await clone('github:jjaimm/vue-template', name)

  // 安装依赖
  log('Installing dependencies ...')
  await spawn('npm', ['install'], { cwd: `./${name}` })
  log('Install dependencies done')

  // 启动服务
  log('Start run serve')
  open('http://localhost:3000')
  await spawn('npm', ['run', 'dev'], { cwd: `./${name}` })
}
