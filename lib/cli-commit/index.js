// const path = require('path')
const { logger, spawn } = require('../util/index')

module.exports = async cmd => {
  logger.log('[None] start git add all files')
  await spawn('git', ['add', '.'], { cwd: process.cwd() })
  logger.log('[None] git push add files success')

  if (!cmd.message) {
    logger.error('[None] you must set commit message')
    process.exit(1)
  }

  logger.log('[None] start git commit files')
  await spawn('git', ['commit', '-am', cmd.message], { cwd: process.cwd() })
  logger.log('[None] git commit success')

  logger.log('[None] start git push files')
  await spawn('git', ['commit', cmd.message], { cwd: process.cwd() })
  logger.log('[None] git push success')
}
