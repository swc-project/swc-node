const { loadBinding } = require('@node-rs/helper')

const defaultOptions = {
  target: 'es2018',
  module: 'commonjs',
  sourcemap: true,
  hygiene: false,
  tsx: false,
  decorators: false,
  dynamic_import: false,
  no_early_errors: true,
}

function convertOptions(options) {
  return JSON.stringify({
    ...options,
    module: {
      type: options.module,
    },
  })
}

const bindings = loadBinding(__dirname, 'swc')

module.exports = {
  transformSync: function transformSync(code, path, options = {}) {
    const source = Buffer.isBuffer(code) ? code : Buffer.from(code)
    return bindings.transformSync(source, path, convertOptions({ ...defaultOptions, ...options }))
  },
  transform: function transform(code, path, options = {}) {
    const source = Buffer.isBuffer(code) ? code : Buffer.from(code)
    return bindings.transformSync(source, path, convertOptions({ ...defaultOptions, ...options }))
  },
}
