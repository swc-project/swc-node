const { loadBinding } = require('@node-rs/helper')

const defaultOptions = {
  target: 'es2018',
  module: 'commonjs',
  sourcemap: true,
  decorators: false,
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

const bindings = loadBinding(__dirname, 'swc')

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
