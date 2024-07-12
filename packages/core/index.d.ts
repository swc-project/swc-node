import { Options as SwcOptions, ReactConfig, Config, JscTarget } from '@swc/core'
export interface Options {
  target?: JscTarget
  module?: 'commonjs' | 'umd' | 'amd' | 'es6'
  sourcemap?: Config['sourceMaps']
  jsx?: boolean
  experimentalDecorators?: boolean
  emitDecoratorMetadata?: boolean
  useDefineForClassFields?: boolean
  dynamicImport?: boolean
  esModuleInterop?: boolean
  keepClassNames?: boolean
  externalHelpers?: boolean
  react?: Partial<ReactConfig>
  baseUrl?: string
  paths?: {
    [from: string]: [string]
  }
  swc?: SwcOptions
  ignoreDynamic?: boolean
}
export declare function transformSync(source: string, path: string, options?: Options): import('@swc/types').Output
export declare function transformJest(source: string, path: string, options?: Options): import('@swc/types').Output
export declare function transform(source: string, path: string, options?: Options): Promise<import('@swc/types').Output>
