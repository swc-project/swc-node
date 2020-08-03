const { platform } = require('os')

const { loadBinding } = require('@node-rs/helper')

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
  transformSync: function transformSync(source, path, options = {}) {
    options.filename = path
    if (!options.jsc) {
      options.jsc = {
        target: 'es2018',
        parser: {
          syntax: 'typescript',
        },
      }
    }
    if (options.jsc.parser) {
      options.jsc.parser.tsx = path.endsWith('.tsx')
    }
    if (!options.module) {
      options.module = {
        type: 'commonjs',
      }
    }
    return bindings.transformSync(source, path, Buffer.from(JSON.stringify(options)))
  },
  transform: function transform(source, path, options = {}) {
    options.filename = path
    if (!options.jsc) {
      options.jsc = {
        target: 'es2018',
        parser: {
          syntax: 'typescript',
        },
      }
    }
    if (options.jsc.parser) {
      options.jsc.parser.tsx = path.endsWith('.tsx')
    }
    if (!options.module) {
      options.module = {
        type: 'commonjs',
      }
    }
    return bindings.transformSync(source, path, Buffer.from(JSON.stringify(options)))
  },
}
