const { transformSync } = require('@swc-node/core')

module.exports = {
  process(src, path, jestConfig) {
    const [, , transformOptions = {}] =
      (jestConfig.transform || []).find(([, transformerPath]) => transformerPath === __filename) || []
    if (/\.(t|j)sx?$/.test(path)) {
      return transformSync(src, path, transformOptions)
    }
    return src
  },
}
