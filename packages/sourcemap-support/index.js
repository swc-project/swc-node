const sourceMapSupport = require('source-map-support')

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

module.exports.SourcemapMap = SourcemapMap
module.exports.installSourceMapSupport = installSourceMapSupport
