const { platform } = require('os')

const { loadBinding } = require('@node-rs/helper')

let bindings
let linuxError = null

try {
  bindings = loadBinding(__dirname, 'swc')
} catch (e) {
  const platformName = platform()
  try {
    bindings = require(`@swc-node/core-${platformName}`)
  } catch (e) {
    if (platformName !== 'linux') {
      throw new TypeError('Not compatible with your platform. Error message: ' + e.message)
    } else {
      linuxError = e
    }
  }
}

if (!bindings) {
  try {
    require.resolve('@swc-node/core-linux-musl')
  } catch (e) {
    throw new TypeError(
      `Could not load @swc-node/core-linux, You may need add @swc-node/core-linux-musl to optionalDependencies of your project`,
    )
  }
  try {
    bindings = require('@swc-node/core-linux-musl')
  } catch (e) {
    throw new TypeError(
      `Linux glibc version load error: ${linuxError.message}; Linux musl version load error: Error message: ${e.message}`,
    )
  }
}

function transformOption(path, options) {
  const opts = options == null ? {} : options
  return Buffer.from(
    JSON.stringify({
      filename: path,
      jsc: {
        target: opts.target || 'es2018',
        parser: {
          syntax: 'typescript',
          tsx: typeof opts.jsx !== 'undefined' ? opts.jsx : path.endsWith('.tsx'),
          decorators: Boolean(opts.experimentalDecorators),
          dynamicImport: Boolean(opts.dynamicImport),
        },
        transform: {
          legacyDecorator: Boolean(opts.experimentalDecorators),
          decoratorMetadata: Boolean(opts.emitDecoratorMetadata),
        },
      },
      isModule: true,
      module: {
        type: opts.module || 'commonjs',
      },
      sourceMaps: typeof opts.sourcemap === 'undefined' ? true : opts.sourcemap,
      swcrc: false,
    }),
  )
}

module.exports = {
  transformSync: function transformSync(source, path, options) {
    return bindings.transformSync(source, path, transformOption(path, options))
  },
  transformJest: function transformJest(source, path, options) {
    return bindings.transformJest(source, path, transformOption(path, options))
  },
  transform: function transform(source, path, options) {
    return bindings.transform(source, path, transformOption(path, options))
  },

  SWC_VERSION: '1.2.21',
}
