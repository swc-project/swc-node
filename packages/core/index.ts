import {
  transform as swcTransform,
  transformSync as swcTransformSync,
  Options as SwcOptions,
  ReactConfig,
  Config,
  JscTarget,
} from '@swc/core'

// Oldest LTS Node.js supported target
const DEFAULT_ES_TARGET: JscTarget = 'es2018'

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

function transformOption(path: string, options?: Options, jest = false): SwcOptions {
  const opts = options ?? {}
  opts.esModuleInterop = opts.esModuleInterop ?? true
  const moduleType = options?.module ?? 'commonjs'
  return {
    filename: path,
    jsc: options?.swc?.swcrc
      ? undefined
      : {
          target: opts.target ?? DEFAULT_ES_TARGET,
          externalHelpers: jest ? true : Boolean(opts.externalHelpers),
          parser: {
            syntax: 'typescript' as const,
            tsx: typeof opts.jsx !== 'undefined' ? opts.jsx : path.endsWith('.tsx'),
            decorators: Boolean(opts.experimentalDecorators),
            dynamicImport: Boolean(opts.dynamicImport),
          },
          transform: {
            legacyDecorator: Boolean(opts.experimentalDecorators),
            decoratorMetadata: Boolean(opts.emitDecoratorMetadata),
            useDefineForClassFields: Boolean(opts.useDefineForClassFields),
            react: options?.react,
            // @ts-expect-error
            hidden: {
              jest,
            },
          },
          keepClassNames: opts.keepClassNames,
          paths: opts.paths,
          baseUrl: opts.baseUrl,
          experimental: {
            keepImportAttributes: true,
          },
        },
    minify: false,
    isModule: true,
    module: options?.swc?.swcrc
      ? undefined
      : {
          type: moduleType,
          ...(moduleType === 'commonjs' || moduleType === 'umd' || moduleType === 'amd'
            ? {
                noInterop: !opts.esModuleInterop,
                ignoreDynamic: opts.ignoreDynamic,
              }
            : undefined),
        },
    sourceMaps: options?.swc?.swcrc
      ? undefined
      : jest || typeof opts.sourcemap === 'undefined'
        ? 'inline'
        : opts.sourcemap,
    inlineSourcesContent: true,
    swcrc: false,
    ...options?.swc,
  }
}

export function transformSync(source: string, path: string, options?: Options) {
  return swcTransformSync(source, transformOption(path, options))
}

export function transformJest(source: string, path: string, options?: Options) {
  return swcTransformSync(source, transformOption(path, options, true))
}

export function transform(source: string, path: string, options?: Options) {
  return swcTransform(source, transformOption(path, options))
}
