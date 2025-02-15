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
    configFileOpts?: ConfigFileOptions
  },
): string

export function compile(
  sourcecode: string | undefined,
  filename: string,
  options: ts.CompilerOptions & {
    fallbackToTs?: (filename: string) => boolean
    configFileOpts?: ConfigFileOptions
  },
  async: false,
): string

export function compile(
  sourcecode: string | undefined,
  filename: string,
  options: ts.CompilerOptions & {
    fallbackToTs?: (filename: string) => boolean
    configFileOpts?: ConfigFileOptions
  },
  async: true,
): Promise<string>

export function compile(
  sourcecode: string | undefined,
  filename: string,
  options: ts.CompilerOptions & {
    fallbackToTs?: (filename: string) => boolean
    configFileOpts?: ConfigFileOptions
  },
  async: boolean,
): string | Promise<string>

export function compile(
  sourcecode: string | undefined,
  filename: string,
  options: ts.CompilerOptions & {
    fallbackToTs?: (filename: string) => boolean
    configFileOpts?: ConfigFileOptions
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

  const configFileOpts: ConfigFileOptions | undefined = structuredClone(options?.configFileOpts)
  if (options) {
    delete options.configFileOpts
  }

  let swcRegisterConfig: Options
  // When SWCRC environment variable is set to true or mode is SWCRC it will use .swcrc file
  if (process.env.SWCRC || configFileOpts?.mode === ConfigFileMode.SWCRC) {
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

export enum ConfigFileMode {
  SWCRC = 'swcrc',
  TSCONFIG = 'tsconfig',
}

export interface ConfigFileOptions {
  mode: ConfigFileMode
  path: string
}

export function register(options: Partial<ts.CompilerOptions> = {}, hookOpts = {}, configFileOpts?: ConfigFileOptions) {
  let compilerOptions: Partial<ts.CompilerOptions & { configFileOpts?: ConfigFileOptions }> = {}

  if (!process.env.SWCRC && configFileOpts?.mode !== ConfigFileMode.SWCRC) {
    compilerOptions = Object.keys(options).length ? options : readDefaultTsConfig(configFileOpts?.path)
  }

  options.module = ts.ModuleKind.CommonJS
  installSourceMapSupport()
  return addHook((code, filename) => compile(code, filename, compilerOptions), {
    exts: Array.from(DEFAULT_EXTENSIONS),
    ...hookOpts,
  })
}
