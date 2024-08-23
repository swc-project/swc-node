import { xxh64 } from '@node-rs/xxhash'
import type { Output } from '@swc/core'
import type { TransformOptions } from '@jest/transform'
import { Options, transformJest } from '@swc-node/core'
import { readDefaultTsConfig, tsCompilerOptionsToSwcConfig } from '@swc-node/register/read-default-tsconfig'

interface TransformerConfig extends Options {
  tsconfig?: string
}

interface JestConfig26 extends TransformOptions {
  transform: [match: string, transformerPath: string, options: TransformerConfig][]
}

type JestConfig27 = TransformOptions<TransformerConfig>

function getJestTransformConfig(jestConfig: JestConfig26 | JestConfig27): TransformerConfig {
  if ('transformerConfig' in jestConfig) {
    // jest 27
    return (jestConfig as JestConfig27).transformerConfig
  }

  if ('transform' in jestConfig) {
    // jest 26
    return (
      (jestConfig as JestConfig26).transform.find(([, transformerPath]) => transformerPath === __filename)?.[2] ?? {}
    )
  }

  return {}
}

export = {
  process(src: string, path: string, jestConfig: JestConfig26 | JestConfig27): Output | string {
    if (/\.(tsx?|jsx?|mjs)$/.test(path)) {
      const transformerConfig = getJestTransformConfig(jestConfig)
      const tsconfig = transformerConfig.tsconfig
        ? transformerConfig.tsconfig.replace('<rootDir>', jestConfig.config.rootDir)
        : undefined
      const tsConfigObject = readDefaultTsConfig(tsconfig)
      return transformJest(src, path, {
        ...tsCompilerOptionsToSwcConfig(tsConfigObject, path),
        ...getJestTransformConfig(jestConfig),
      })
    }
    return src
  },
  getCacheKey(src: string, _filepath: string, config: Options) {
    return xxh64(src + JSON.stringify(config)).toString(16)
  },
}
