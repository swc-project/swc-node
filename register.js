const { loadBinding } = require('@node-rs/helper')
const sourceMapSupport = require('source-map-support')
const { addHook } = require('pirates')

const { transformSync } = loadBinding(__dirname, 'swc')

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

module.exports = function register() {
  installSourceMapSupport()
  addHook(compile, {
    exts: DEFAULT_EXTENSIONS,
  })
}
