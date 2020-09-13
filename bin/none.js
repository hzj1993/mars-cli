#!/usr/bin/env node
const program = require('commander')

program.version(require('../package.json').version)

program
  .command('init <app-name>')
  .description('init project')
  .action(require('../lib/cli-init/index'))

program
  .command('dev')
  .description('run a server for current project')
  .option('-o, --open', 'Open brower')
  .action(require('../lib/cli-server/index'))

program
  .command('build')
  .description('build the project')
  .option('-d, --dest <dir>', 'output directory (default: dist)')
  .action(require('../lib/cli-build/index'))

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
  .action(require('../lib/cli-commit/index'))

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
