import { Options, transform, transformSync } from '@swc-node/core'
import { installSourceMapSupport, SourcemapMap } from '@swc-node/sourcemap-support'
import { addHook } from 'pirates'
import * as ts from 'typescript'

import { readDefaultTsConfig, tsCompilerOptionsToSwcConfig } from './read-default-tsconfig'

const DEFAULT_EXTENSIONS = new Set([
  ts.Extension.Js,
  ts.Extension.Ts,
  ts.Extension.Jsx,
  ts.Extension.Tsx,
  ts.Extension.Mjs,
  ts.Extension.Mts,
  ts.Extension.Cjs,
  ts.Extension.Cts,
  '.es6',
  '.es',
])

const injectInlineSourceMap = ({
  filename,
  code,
  map,
}: {
  filename: string
  code: string
  map: string | undefined
}): string => {
  if (map) {
    SourcemapMap.set(filename, map)
    const base64Map = Buffer.from(map, 'utf8').toString('base64')
    const sourceMapContent = `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${base64Map}`
    return `${code}\n${sourceMapContent}`
  }
  return code
}

export function compile(
  sourcecode: string | undefined,
  filename: string,
  options: ts.CompilerOptions & {
    fallbackToTs?: (filename: string) => boolean
  },
): string

export function compile(
  sourcecode: string | undefined,
  filename: string,
  options: ts.CompilerOptions & {
    fallbackToTs?: (filename: string) => boolean
  },
  async: false,
): string

export function compile(
  sourcecode: string | undefined,
  filename: string,
  options: ts.CompilerOptions & {
    fallbackToTs?: (filename: string) => boolean
  },
  async: true,
): Promise<string>

export function compile(
  sourcecode: string | undefined,
  filename: string,
  options: ts.CompilerOptions & {
    fallbackToTs?: (filename: string) => boolean
  },
  async: boolean,
): string | Promise<string>

export function compile(
  sourcecode: string | undefined,
  filename: string,
  options: ts.CompilerOptions & {
    fallbackToTs?: (filename: string) => boolean
  },
  async = false,
) {
  if (sourcecode == null) {
    return
  }
  if (options && typeof options.fallbackToTs === 'function' && options.fallbackToTs(filename)) {
    delete options.fallbackToTs
    const { outputText, sourceMapText } = ts.transpileModule(sourcecode, {
      fileName: filename,
      compilerOptions: options,
    })
    return injectInlineSourceMap({ filename, code: outputText, map: sourceMapText })
  }

  let swcRegisterConfig: Options
  if (process.env.SWCRC) {
    // when SWCRC environment variable is set to true it will use swcrc file
    swcRegisterConfig = {
      swc: {
        swcrc: true,
      },
    }
  } else {
    swcRegisterConfig = tsCompilerOptionsToSwcConfig(options, filename)
  }

  if (async) {
    return transform(sourcecode, filename, swcRegisterConfig).then(({ code, map }) => {
      return injectInlineSourceMap({ filename, code, map })
    })
  } else {
    const { code, map } = transformSync(sourcecode, filename, swcRegisterConfig)
    return injectInlineSourceMap({ filename, code, map })
  }
}

export function register(options: Partial<ts.CompilerOptions> = {}, hookOpts = {}) {
  if (!process.env.SWCRC) {
    options = Object.keys(options).length ? options : readDefaultTsConfig()
  }
  options.module = ts.ModuleKind.CommonJS
  installSourceMapSupport()
  return addHook((code, filename) => compile(code, filename, options), {
    exts: Array.from(DEFAULT_EXTENSIONS),
    ...hookOpts,
  })
}
