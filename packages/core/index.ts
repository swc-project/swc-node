import { platform } from 'os'
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
}

let bindings: any
let linuxError: Error | null = null

try {
  bindings = loadBinding(join(require.resolve('@swc-node/core'), '..', '..'), 'swc')
} catch (e) {
  const platformName = platform()
  try {
    bindings = require(`@swc-node/core-${platformName}`)
  } catch (e) {
    if (platformName !== 'linux') {
      throw new TypeError('Not compatible with your platform. Error message: ' + e.message)
    } else {
      linuxError = e
    }
  }
}

if (!bindings) {
  try {
    require.resolve('@swc-node/core-linux-musl')
  } catch (e) {
    throw new TypeError(
      `Could not load @swc-node/core-linux-musl, You may need add @swc-node/core-linux-musl to optionalDependencies of your project`,
    )
  }
  try {
    bindings = require('@swc-node/core-linux-musl')
  } catch (e) {
    throw new TypeError(
      `Linux glibc version load error: ${linuxError!.message}; Linux musl version load error: Error message: ${
        e.message
      }`,
    )
  }
}

function transformOption(path: string, options?: Options) {
  const opts = options == null ? {} : options
  return {
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
    },
    sourceMaps: typeof opts.sourcemap === 'undefined' ? true : opts.sourcemap,
    swcrc: false,
  }
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

export const SWC_VERSION = '1.2.22'
