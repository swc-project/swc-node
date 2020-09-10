import { join } from 'path'

import { loadBinding } from '@node-rs/helper'

export interface Options {
  target?: 'es3' | 'es5' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020'
  module?: 'commonjs' | 'umd' | 'amd' | 'es6'
  sourcemap?: boolean | 'inline'
  jsx?: boolean
  experimentalDecorators?: boolean
  emitDecoratorMetadata?: boolean
  dynamicImport?: boolean
  esModuleInterop?: boolean
}

const bindings = loadBinding(join(require.resolve('@swc-node/core'), '..', '..'), 'swc', '@swc-node/core')

function transformOption(path: string, options?: Options) {
  const opts = options == null ? {} : options
  opts.esModuleInterop = opts.esModuleInterop ?? true
  return JSON.stringify({
    filename: path,
    jsc: {
      target: opts.target ?? 'es2018',
      parser: {
        syntax: 'typescript',
        tsx: typeof opts.jsx !== 'undefined' ? opts.jsx : path.endsWith('.tsx'),
        decorators: Boolean(opts.experimentalDecorators),
        dynamicImport: Boolean(opts.dynamicImport),
      },
      transform: {
        legacyDecorator: Boolean(opts.experimentalDecorators),
        decoratorMetadata: Boolean(opts.emitDecoratorMetadata),
      },
    },
    isModule: true,
    module: {
      type: opts.module ?? 'commonjs',
      noInterop: !opts.esModuleInterop,
    },
    sourceMaps: typeof opts.sourcemap === 'undefined' ? true : opts.sourcemap,
    swcrc: false,
  })
}

export function transformSync(source: string, path: string, options?: Options) {
  return bindings.transformSync(source, path, transformOption(path, options))
}

export function transformJest(source: string, path: string, options?: Options) {
  return bindings.transformJest(source, path, transformOption(path, options))
}

export function transform(source: string, path: string, options?: Options) {
  return bindings.transform(source, path, transformOption(path, options))
}

export const SWC_VERSION = '3a26d3d'
