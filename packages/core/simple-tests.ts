import chalk from 'chalk'

import { transformSync } from './index'

console.assert(typeof transformSync(`const a = 1`, 'test.js').code === 'string')

console.info(chalk.green('Simple test pass ✅'))
