const { transformSync } = require('@swc-node/core')
const { addHook } = require('pirates')
const sourceMapSupport = require('source-map-support')

const DEFAULT_EXTENSIONS = Object.freeze(['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx', '.d.ts'])

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
  const { code, map } = transformSync(sourcecode, filename, options)
  SourcemapMap.set(filename, map)
  return code
}

module.exports = function register(options = {}) {
  installSourceMapSupport()
  addHook((code, filename) => compile(code, filename, options), {
    exts: DEFAULT_EXTENSIONS,
  })
}
