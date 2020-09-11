import { existsSync } from 'fs'
import { join, parse } from 'path'

import { transformSync } from '@swc-node/core'
import { SourcemapMap, installSourceMapSupport } from '@swc-node/sourcemap-support'
import debugFactory from 'debug'
import { addHook } from 'pirates'
import * as ts from 'typescript'

const debug = debugFactory('@swc-node')

const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx', '.d.ts']

function toTsTarget(target: ts.ScriptTarget) {
  switch (target) {
    case ts.ScriptTarget.ES3:
      return 'es3'
    case ts.ScriptTarget.ES5:
      return 'es5'
    case ts.ScriptTarget.ES2015:
      return 'es2015'
    case ts.ScriptTarget.ES2016:
      return 'es2016'
    case ts.ScriptTarget.ES2017:
      return 'es2017'
    case ts.ScriptTarget.ES2018:
      return 'es2018'
    case ts.ScriptTarget.ES2019:
      return 'es2019'
    case ts.ScriptTarget.ES2020:
    case ts.ScriptTarget.ESNext:
    case ts.ScriptTarget.Latest:
      return 'es2020'
    case ts.ScriptTarget.JSON:
      return 'es5'
  }
}

function toModule(moduleKind: ts.ModuleKind) {
  switch (moduleKind) {
    case ts.ModuleKind.CommonJS:
      return 'commonjs'
    case ts.ModuleKind.UMD:
      return 'umd'
    case ts.ModuleKind.AMD:
      return 'amd'
    case ts.ModuleKind.ES2015:
    case ts.ModuleKind.ES2020:
    case ts.ModuleKind.ESNext:
    case ts.ModuleKind.None:
      return 'es6'
    case ts.ModuleKind.System:
      throw new TypeError('Do not support system kind module')
  }
}

function compile(
  sourcecode: string,
  filename: string,
  options: ts.CompilerOptions & { fallbackToTs?: (filename: string) => boolean },
) {
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
    const { code, map } = transformSync(sourcecode, filename, {
      target: toTsTarget(options.target ?? ts.ScriptTarget.ES2018),
      module: toModule(options.module ?? ts.ModuleKind.ES2015),
      sourcemap: options.sourceMap !== false,
      jsx: filename.endsWith('.tsx') || filename.endsWith('.jsx') || Boolean(options.jsx),
      experimentalDecorators: options.experimentalDecorators ?? false,
      emitDecoratorMetadata: options.emitDecoratorMetadata ?? false,
      dynamicImport: options.module ? options.module >= ts.ModuleKind.ES2020 : true,
      esModuleInterop: options.esModuleInterop ?? false,
    })
    // in case of map is undefined
    if (map) {
      SourcemapMap.set(filename, map)
    }
    return code
  }
}

export function readDefaultTsConfig() {
  const tsConfigPath =
    process.env.SWC_NODE_PROJECT ?? process.env.TS_NODE_PROJECT ?? join(process.cwd(), 'tsconfig.json')

  let compilerOptions: Partial<ts.CompilerOptions & { fallbackToTs: (path: string) => boolean }> = {
    target: ts.ScriptTarget.ES2018,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    sourceMap: true,
    esModuleInterop: true,
  }

  if (tsConfigPath && existsSync(tsConfigPath)) {
    try {
      debug(`Read config file from ${tsConfigPath}`)
      const { config } = ts.readConfigFile(tsConfigPath, ts.sys.readFile)

      const { options, errors } = ts.parseJsonConfigFileContent(config, ts.sys, parse(tsConfigPath).dir)
      if (!errors.length) {
        compilerOptions = options
      } else {
        debug(`Convert compiler options from json failed`, errors)
      }
    } catch (e) {
      debug(`Read ${tsConfigPath} failed: ${e.message}`)
    }
  }
  return compilerOptions
}

export function register(options = readDefaultTsConfig()) {
  installSourceMapSupport()
  addHook((code, filename) => compile(code, filename, options), {
    exts: DEFAULT_EXTENSIONS,
  })
}
