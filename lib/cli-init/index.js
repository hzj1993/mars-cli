// const { promisify } = require('util')
// const figlet = promisify(require('figlet'))
const fs = require('fs')
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
  // await clone('github:jjaimm/vue-template', name)
  await spawn('npm', ['init', 'vite-app', name], { cwd: process.cwd() })

  // 初始化脚手架所需依赖，写入packge.json
  const dep = {
    '@babel/core': '^7.11.6',
    '@babel/preset-env': '^7.11.5',
    'babel-loader': '^8.1.0',
    'cache-loader': '^4.1.0',
    'css-loader': '^4.3.0',
    eslint: '^7.9.0',
    'eslint-loader': '^4.0.2',
    'file-loader': '^6.1.0',
    'hard-source-webpack-plugin': '^0.13.1',
    'html-webpack-externals-plugin': '^3.8.0',
    'html-webpack-plugin': '^4.4.1',
    'image-webpack-loader': '^7.0.0',
    less: '^3.12.2',
    'less-loader': '^7.0.1',
    'postcss-loader': '^4.0.2',
    'thread-loader': '^3.0.0'
  }

  // 安装依赖
  log('Start install dependencies (default use npm)')
  await spawn('npm', ['install'], { cwd: `./${name}` })
  log('Install dependencies done')

  // // 启动服务
  // log('Start run serve')
  // open('http://localhost:3000')
  // await spawn('npm', ['run', 'dev'], { cwd: `./${name}` })
}
