const { loadBinding } = require('@node-rs/helper')
const { transformSync } = loadBinding(__dirname, 'swc')

module.exports.transformSync = transformSync
module.exports.register = require('./register')
