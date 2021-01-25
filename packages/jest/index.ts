import { createHash } from 'crypto'

import { transformJest } from '@swc-node/core'
import { Output } from '@swc/core'

const Cache = new Map<string, Output>()

export = {
  process(src: string, path: string, jestConfig: any) {
    const [, , transformOptions = {}] =
      (jestConfig.transform || []).find(([, transformerPath]: [string, string]) => transformerPath === __filename) || []
    if (/\.(t|j)sx?$/.test(path)) {
      // sha1 is fast, and we don't care about security here
      const cacheHash = createHash('sha1')
      cacheHash.update(src)
      const hash = cacheHash.digest('hex')
      const cacheKey = `${path}-${hash}`
      if (Cache.has(cacheKey)) {
        return Cache.get(cacheKey)
      }
      const output = transformJest(src, path, transformOptions)
      Cache.set(cacheKey, output)
      return output
    }
    return src
  },
}
