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
  dynamicImport?: boolean
  esModuleInterop?: boolean
  keepClassNames?: boolean
  react?: Partial<ReactConfig>
  paths?: {
    [from: string]: [string]
  }
  swc?: SwcOptions
}

function transformOption(path: string, options?: Options, jest = false): SwcOptions {
  const opts = options == null ? {} : options
  opts.esModuleInterop = opts.esModuleInterop ?? true
  return {
    filename: path,
    jsc: {
      target: opts.target ?? DEFAULT_ES_TARGET,
      externalHelpers: jest ? true : false,
      parser: {
        syntax: 'typescript' as const,
        tsx: typeof opts.jsx !== 'undefined' ? opts.jsx : path.endsWith('.tsx'),
        decorators: Boolean(opts.experimentalDecorators),
        dynamicImport: Boolean(opts.dynamicImport),
      },
      transform: {
        legacyDecorator: Boolean(opts.experimentalDecorators),
        decoratorMetadata: Boolean(opts.emitDecoratorMetadata),
        react: options?.react,
        hidden: {
          jest,
        },
      },
      keepClassNames: opts.keepClassNames,
      paths: opts.paths,
    },
    minify: false,
    isModule: true,
    module: {
      type: options?.module ?? 'commonjs',
      noInterop: !opts.esModuleInterop,
    },
    sourceMaps: jest || typeof opts.sourcemap === 'undefined' ? 'inline' : opts.sourcemap,
    inlineSourcesContent: true,
    swcrc: false,
    ...(options?.swc ?? {}),
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
