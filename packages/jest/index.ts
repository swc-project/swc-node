import { createHash } from 'crypto'

import { Options, transformJest } from '@swc-node/core'
import type { Output } from '@swc/core'

const Cache = new Map<string, Output>()

interface JestConfig26 {
  transform: [match: string, transformerPath: string, options: Options][]
}

interface JestConfig27 {
  transformerConfig: Options
}

function getJestTransformConfig(jestConfig: JestConfig26 | JestConfig27): Options {
  if ('transformerConfig' in jestConfig) {
    // jest 27
    return jestConfig.transformerConfig
  }

  if ('transform' in jestConfig) {
    // jest 26
    return jestConfig.transform.find(([, transformerPath]) => transformerPath === __filename)?.[2] ?? {}
  }

  return {}
}

export = {
  process(src: string, path: string, jestConfig: JestConfig26 | JestConfig27) {
    if (/\.(t|j)sx?$/.test(path)) {
      // sha1 is fast, and we don't care about security here
      const cacheHash = createHash('sha1')
      cacheHash.update(src)
      const hash = cacheHash.digest('hex')
      const cacheKey = `${path}-${hash}`
      const maybeCachedEntry = Cache.get(cacheKey)
      if (maybeCachedEntry !== undefined) {
        return maybeCachedEntry
      }
      const output = transformJest(src, path, getJestTransformConfig(jestConfig))
      Cache.set(cacheKey, output)
      return output
    }
    return src
  },
}
