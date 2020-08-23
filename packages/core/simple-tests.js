const { transformSync } = require('./index')

console.assert(typeof transformSync(`const a = 1`, 'test.js').code === 'string')
