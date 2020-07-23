const { transformSync } = require('@swc-node/core')
const { addHook } = require('pirates')
const sourceMapSupport = require('source-map-support')

const DEFAULT_EXTENSIONS = Object.freeze(['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx'])

const SourcemapMap = new Map()

function installSourceMapSupport() {
  sourceMapSupport.install({
    handleUncaughtExceptions: false,
    environment: 'node',
    retrieveSourceMap(file) {
      if (SourcemapMap.has(file)) {
        return {
          url: file,
          map: SourcemapMap.get(file),
        }
      }
      return null
    },
  })
}

function compile(sourcecode, filename, options) {
  const { code, map } = transformSync(
    Buffer.isBuffer(sourcecode) ? sourcecode : Buffer.from(sourcecode),
    filename,
    JSON.stringify(options),
  )
  SourcemapMap.set(filename, map)
  return code
}

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
  return {
    ...options,
    module: {
      type: options.module,
    },
  }
}

module.exports = function register(options = {}) {
  installSourceMapSupport()
  addHook((code, filename) => compile(code, filename, convertOptions({ ...defaultOptions, ...options })), {
    exts: DEFAULT_EXTENSIONS,
  })
}
