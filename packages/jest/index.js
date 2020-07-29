const { transformSync } = require('@swc-node/core')

module.exports = {
  process(src, path, _jestConfig, transformOptions = {}) {
    if (/\.(t|j)sx?$/.test(path)) {
      return transformSync(src, path, { ...transformOptions, filename: path })
    }
    return src
  },
}
