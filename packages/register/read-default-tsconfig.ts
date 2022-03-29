import { existsSync } from 'fs'
import { join, dirname, resolve } from 'path'

import type { Options } from '@swc-node/core'
import { yellow } from 'colorette'
import debugFactory from 'debug'
import * as ts from 'typescript'

const debug = debugFactory('@swc-node')

export function readDefaultTsConfig(
  tsConfigPath = process.env.SWC_NODE_PROJECT ?? process.env.TS_NODE_PROJECT ?? join(process.cwd(), 'tsconfig.json'),
) {
  let compilerOptions: Partial<ts.CompilerOptions & { fallbackToTs: (path: string) => boolean }> = {
    target: ts.ScriptTarget.ES2018,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    sourceMap: true,
    esModuleInterop: true,
  }

  if (!tsConfigPath) {
    return compilerOptions
  }

  const fullTsConfigPath = resolve(tsConfigPath)

  if (!existsSync(fullTsConfigPath)) {
    return compilerOptions
  }

  try {
    debug(`Read config file from ${fullTsConfigPath}`)
    const { config } = ts.readConfigFile(fullTsConfigPath, ts.sys.readFile)

    const { options, errors, fileNames } = ts.parseJsonConfigFileContent(config, ts.sys, dirname(fullTsConfigPath))
    if (!errors.length) {
      compilerOptions = options
      compilerOptions.files = fileNames
    } else {
      console.info(yellow(`Convert compiler options from json failed, ${errors.map((d) => d.messageText).join('\n')}`))
    }
  } catch (e) {
    console.info(yellow(`Read ${tsConfigPath} failed: ${(e as Error).message}`))
  }

  return compilerOptions
}

function toTsTarget(target: ts.ScriptTarget): Options['target'] {
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
      return 'es2020'
    case ts.ScriptTarget.ES2021:
    case ts.ScriptTarget.ESNext:
    case ts.ScriptTarget.Latest:
      return 'es2021'
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
    case ts.ModuleKind.ES2022:
    case ts.ModuleKind.ESNext:
    case ts.ModuleKind.Node12:
    case ts.ModuleKind.NodeNext:
    case ts.ModuleKind.None:
      return 'es6'
    case ts.ModuleKind.System:
      throw new TypeError('Do not support system kind module')
  }
}

export function createSourcemapOption(options: ts.CompilerOptions) {
  return options.sourceMap !== false
    ? options.inlineSourceMap
      ? 'inline'
      : true
    : options.inlineSourceMap
    ? 'inline'
    : false
}

export function tsCompilerOptionsToSwcConfig(options: ts.CompilerOptions, filename: string): Options {
  return {
    target: toTsTarget(options.target ?? ts.ScriptTarget.ES2018),
    module: toModule(options.module ?? ts.ModuleKind.ES2015),
    sourcemap: createSourcemapOption(options),
    jsx: filename.endsWith('.tsx') || filename.endsWith('.jsx') || Boolean(options.jsx),
    react:
      options.jsxFactory || options.jsxFragmentFactory || options.jsx || options.jsxImportSource
        ? {
            pragma: options.jsxFactory,
            pragmaFrag: options.jsxFragmentFactory,
            importSource: options.jsxImportSource,
            runtime: (options.jsx ?? 0) >= ts.JsxEmit.ReactJSX ? 'automatic' : 'classic',
          }
        : undefined,
    experimentalDecorators: options.experimentalDecorators ?? false,
    emitDecoratorMetadata: options.emitDecoratorMetadata ?? false,
    dynamicImport: true,
    esModuleInterop: options.esModuleInterop ?? false,
    keepClassNames: true,
    paths: options.paths as Options['paths'],
  }
}
