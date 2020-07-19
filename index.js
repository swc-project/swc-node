const { loadBinding } = require('@node-rs/helper')
const sourceMapSupport = require('source-map-support')

const { transformSync } = loadBinding(__dirname, 'swc')

const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs']

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

function compile(code, filename) {
  const { js, warnings, jsSourceMap } = transformSync(code, filename)
  SourcemapMap.set(filename, jsSourceMap)
  if (warnings && warnings.length > 0) {
    for (const warning of warnings) {
      console.log(warning.location)
      console.log(warning.text)
    }
  }
  return js
}

export function register() {
  installSourceMapSupport()
  addHook(compile, {
    exts: DEFAULT_EXTENSIONS,
  })
}
