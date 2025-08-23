import { xxh64 } from '@node-rs/xxhash'
import type { Output } from '@swc/core'
import { Options, transformJest } from '@swc-node/core'
import { readDefaultTsConfig, tsCompilerOptionsToSwcConfig } from '@swc-node/register/read-default-tsconfig'

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

const defaultTsConfig = readDefaultTsConfig()

export = {
  process(src: string, path: string, jestConfig: JestConfig26 | JestConfig27): Output {
    if (/\.[cm]?[jt]sx?$/.test(path)) {
      return transformJest(src, path, {
        ...tsCompilerOptionsToSwcConfig(defaultTsConfig, path),
        ...getJestTransformConfig(jestConfig),
      })
    }

    // Since Jest 28, "process" no longer accepts a string output.
    return { code: src }
  },
  getCacheKey(src: string, _filepath: string, config: Options) {
    return xxh64(src + JSON.stringify(config)).toString(16)
  },
}
