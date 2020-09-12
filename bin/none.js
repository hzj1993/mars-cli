#!/usr/bin/env node
const program = require('commander')

program.version(require('../package.json').version)

program
  .command('init <name>')
  .description('init project')
  .action(require('../lib/cli-init/index'))

program
  .command('dev')
  .description('run a server for current project')
  .option('-o, --open', 'Open brower')
  .action((cmd) => {
    console.log('cmd', cmd)
  })

program
  .command('build')
  .description('build the project')
  .option('-d, --dest <dir>', 'output directory (default: dist)')
  .action((cmd) => {
    console.log('cmd', cmd)
  })

program
  .command('test')
  .description('run test')
  .action(() => {
    console.log('running test')
  })

program
  .command('commit')
  .description('git commit with custom config')
  .option('-a, --amend', 'git add all files but ignore .idea/ and commit amend')
  .option('-p, --push <branch>', 'git push branch (default: current branch)')
  .option('-m, --message <message>', 'git commit message')
  .action((cmd) => {
    console.log('cmd', cmd)
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}