const { platform } = require('os')

const { loadBinding } = require('@node-rs/helper')

const defaultOptions = {
  target: 'es2018',
  module: 'commonjs',
  sourcemap: true,
  legacyDecorator: false,
  dynamicImport: false,
  noEarlyErrors: true,
}

function convertOptions(options, path) {
  return JSON.stringify({
    ...options,
    filename: path,
    tsx: path.endsWith('.tsx'),
    module: {
      type: options.module,
    },
  })
}

let bindings

try {
  bindings = loadBinding(__dirname, 'swc')
  // eslint-disable-next-line no-empty
} catch (e) {
  try {
    bindings = require(`@swc-node/core-${platform()}`)
  } catch (e) {
    throw new TypeError('Not compatible with your platform')
  }
}

module.exports = {
  transformSync: function transformSync(code, path, options = {}) {
    const source = Buffer.isBuffer(code) ? code : Buffer.from(code)
    return bindings.transformSync(source, path, convertOptions({ ...defaultOptions, ...options }, path))
  },
  transform: function transform(code, path, options = {}) {
    const source = Buffer.isBuffer(code) ? code : Buffer.from(code)
    return bindings.transformSync(source, path, convertOptions({ ...defaultOptions, ...options }))
  },
}
