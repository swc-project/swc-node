import { platform } from 'os'
import { resolve } from 'path'

import { transformSync } from '@swc-node/core'
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
  } else {
    const { code, map } = transformSync(sourcecode, filename, tsCompilerOptionsToSwcConfig(options, filename))
    // in case of map is undefined
    if (map) {
      SourcemapMap.set(filename, map)
    }
    return code
  }
}

export function register(options = readDefaultTsConfig(), hookOpts = {}) {
  installSourceMapSupport()
  return addHook((code, filename) => compile(code, filename, options), {
    exts: DEFAULT_EXTENSIONS,
    ...hookOpts,
  })
}
