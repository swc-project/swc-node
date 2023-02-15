import { platform } from 'os'
import { resolve } from 'path'

import { transform, transformSync, Options } from '@swc-node/core'
import { SourcemapMap, installSourceMapSupport } from '@swc-node/sourcemap-support'
import { addHook } from 'pirates'
import * as ts from 'typescript'

import { readDefaultTsConfig, tsCompilerOptionsToSwcConfig } from './read-default-tsconfig'

const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx']
const PLATFORM = platform()

export function compile(
  sourcecode: string,
  filename: string,
  options: ts.CompilerOptions & { fallbackToTs?: (filename: string) => boolean },
): string

export function compile(
  sourcecode: string,
  filename: string,
  options: ts.CompilerOptions & { fallbackToTs?: (filename: string) => boolean },
  async: false,
): string

export function compile(
  sourcecode: string,
  filename: string,
  options: ts.CompilerOptions & { fallbackToTs?: (filename: string) => boolean },
  async: true,
): Promise<string>

export function compile(
  sourcecode: string,
  filename: string,
  options: ts.CompilerOptions & { fallbackToTs?: (filename: string) => boolean },
  async: boolean,
): string | Promise<string>

export function compile(
  sourcecode: string,
  filename: string,
  options: ts.CompilerOptions & { fallbackToTs?: (filename: string) => boolean },
  async = false,
) {
  if (filename.endsWith('.d.ts')) {
    return ''
  }
  if (options.files && (options.files as string[]).length) {
    if (
      PLATFORM === 'win32' &&
      (options.files as string[]).every((file) => filename !== resolve(process.cwd(), file))
    ) {
      return sourcecode
    }
    if (PLATFORM !== 'win32' && (options.files as string[]).every((file) => !filename.endsWith(file))) {
      return sourcecode
    }
  }
  if (options && typeof options.fallbackToTs === 'function' && options.fallbackToTs(filename)) {
    delete options.fallbackToTs
    const { outputText, sourceMapText } = ts.transpileModule(sourcecode, {
      fileName: filename,
      compilerOptions: options,
    })
    if (sourceMapText) {
      SourcemapMap.set(filename, sourceMapText)
    }
    return outputText
  } else if (async) {
    return transform(sourcecode, filename, tsCompilerOptionsToSwcConfig(options, filename)).then(({ code, map }) => {
      // in case of map is undefined
      if (map) {
        SourcemapMap.set(filename, map)
      }
      return code
    })
  } else {
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
    const { code, map } = transformSync(sourcecode, filename, swcRegisterConfig)
    // in case of map is undefined
    if (map) {
      SourcemapMap.set(filename, map)
    }
    return code
  }
}

export function register(options: Partial<ts.CompilerOptions> = {}, hookOpts = {}) {
  if (!process.env.SWCRC) {
    options = readDefaultTsConfig()
  }
  options.module = ts.ModuleKind.CommonJS
  installSourceMapSupport()
  return addHook((code, filename) => compile(code, filename, options), {
    exts: DEFAULT_EXTENSIONS,
    ...hookOpts,
  })
}
