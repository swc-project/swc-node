const { loadBinding } = require('@node-rs/helper')
const { transformSync } = loadBinding(__dirname, 'swc')

module.exports.transformSync = transformSync
