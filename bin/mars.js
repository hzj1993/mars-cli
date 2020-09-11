#!/usr/bin/env node
const program = require('commander')

program.version(require('../package.json').version)

program
  .command('init <name>')
  .description('init project')
  .action(require('../lib/cli-init/index'))

program
  .command('push')
  .description('git commit and push')
  .option('--amend', 'git add all files but ignore .idea/ and commit amend and push the project')
  .action((cmd) => {
    require('../lib/outdated')(cleanArgs(cmd))
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}