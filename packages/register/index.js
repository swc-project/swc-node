const { transformSync } = require('@swc-node/core')
const sourceMapSupport = require('source-map-support')
const { addHook } = require('pirates')

const DEFAULT_EXTENSIONS = Object.freeze([
  '.js',
  '.jsx',
  '.es6',
  '.es',
  '.mjs',
  '.ts',
  '.tsx'
])

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

function compile(sourcecode, filename) {
  const { code, map } = transformSync(Buffer.isBuffer(sourcecode) ? code : Buffer.from(sourcecode), filename)
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

module.exports = function register(options = {}) {
  installSourceMapSupport()
  addHook((code, filename) => compile(code, filename, { ...defaultOptions, ...options }), {
    exts: DEFAULT_EXTENSIONS,
  })
}
