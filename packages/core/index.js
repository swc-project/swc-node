const { platform } = require('os')

const { loadBinding } = require('@node-rs/helper')

const defaultOptions = {
  target: 'es2018',
  module: 'commonjs',
  sourcemap: true,
  legacyDecorator: false,
  dynamicImport: false,
  tsx: false,
}

let bindings

try {
  bindings = loadBinding(__dirname, 'swc')
  // eslint-disable-next-line no-empty
} catch (e) {
  try {
    bindings = require(`@swc-node/core-${platform()}`)
  } catch (e) {
    throw new TypeError('Not compatible with your platform. Error message: ' + e.message)
  }
}

module.exports = {
  transformSync: function transformSync(code, path, options = {}) {
    const source = Buffer.isBuffer(code) ? code : Buffer.from(code)
    return bindings.transformSync(
      source,
      path,
      typeof options.target === 'undefined' ? defaultOptions.target : options.target,
      typeof options.module === 'undefined' ? defaultOptions.module : options.module,
      typeof options.sourcemap === 'undefined' ? defaultOptions.sourcemap : options.sourcemap,
      typeof options.legacyDecorator === 'undefined' ? defaultOptions.legacyDecorator : options.legacyDecorator,
      typeof options.dynamicImport === 'undefined' ? defaultOptions.dynamicImport : options.dynamicImport,
      typeof options.tsx === 'undefined' ? defaultOptions.tsx : options.tsx,
    )
  },
  transform: function transform(code, path, options = defaultOptions) {
    const source = Buffer.isBuffer(code) ? code : Buffer.from(code)
    return bindings.transform(
      source,
      path,
      typeof options.target === 'undefined' ? defaultOptions.target : options.target,
      typeof options.module === 'undefined' ? defaultOptions.module : options.module,
      typeof options.sourcemap === 'undefined' ? defaultOptions.sourcemap : options.sourcemap,
      typeof options.legacyDecorator === 'undefined' ? defaultOptions.legacyDecorator : options.legacyDecorator,
      typeof options.dynamicImport === 'undefined' ? defaultOptions.dynamicImport : options.dynamicImport,
      typeof options.tsx === 'undefined' ? defaultOptions.tsx : options.tsx,
    )
  },
}
