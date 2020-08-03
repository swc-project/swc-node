const { platform } = require('os')

const { loadBinding } = require('@node-rs/helper')

let bindings

try {
  bindings = loadBinding(__dirname, 'swc')
} catch (e) {
  try {
    bindings = require(`@swc-node/core-${platform()}`)
  } catch (e) {
    throw new TypeError('Not compatible with your platform. Error message: ' + e.message)
  }
}

module.exports = {
  transformSync: function transformSync(source, path, options) {
    const opts = options == null ? {} : options
    const swcOptions = {
      filename: path,
      jsc: {
        target: 'es2018',
        parser: {
          syntax: 'typescript',
          tsx: path.endsWith('.tsx'),
          decorators: Boolean(opts.legacyDecorator),
          dynamicImport: Boolean(opts.dynamicImport),
        },
        transform: {
          legacyDecorator: Boolean(opts.legacyDecorator),
        },
      },
      isModule: true,
      module: {
        type: opts.module || 'commonjs',
      },
      sourceMaps: opts.sourcemap,
    }
    return bindings.transformSync(source, path, Buffer.from(JSON.stringify(swcOptions)))
  },
  transform: function transform(source, path, options) {
    const opts = options == null ? {} : options
    const swcOptions = {
      filename: path,
      jsc: {
        target: 'es2018',
        parser: {
          syntax: 'typescript',
          tsx: path.endsWith('.tsx'),
          decorators: Boolean(opts.legacyDecorator),
          dynamicImport: Boolean(opts.dynamicImport),
        },
        transform: {
          legacyDecorator: Boolean(opts.legacyDecorator),
        },
      },
      isModule: true,
      module: {
        type: opts.module || 'commonjs',
      },
      sourceMaps: opts.sourcemap,
    }
    return bindings.transformSync(source, path, Buffer.from(JSON.stringify(swcOptions)))
  },
}
