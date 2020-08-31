import { transformJest } from '@swc-node/core'

export = {
  process(src: string, path: string, jestConfig: any) {
    const [, , transformOptions = {}] =
      (jestConfig.transform || []).find(([, transformerPath]: [string, string]) => transformerPath === __filename) || []
    if (/\.(t|j)sx?$/.test(path)) {
      return transformJest(src, path, transformOptions)
    }
    return src
  },
}
