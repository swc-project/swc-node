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

    // if baseUrl not set, use dirname of tsconfig.json. align with ts https://www.typescriptlang.org/tsconfig#paths
    if (options.paths && !options.baseUrl) {
      options.baseUrl = dirname(fullTsConfigPath)
    }

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
      return 'es2021'
    case ts.ScriptTarget.ES2022:
    case ts.ScriptTarget.ESNext:
    case ts.ScriptTarget.Latest:
      return 'es2022'
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
    case ts.ModuleKind.Node16:
    case ts.ModuleKind.NodeNext:
    case ts.ModuleKind.None:
      return 'es6'
    case ts.ModuleKind.System:
      throw new TypeError('Do not support system kind module')
  }
}

/**
 * The default value for useDefineForClassFields depends on the emit target
 * @see https://www.typescriptlang.org/tsconfig#useDefineForClassFields
 */
function getUseDefineForClassFields(compilerOptions: ts.CompilerOptions, target: ts.ScriptTarget): boolean {
  return compilerOptions.useDefineForClassFields ?? target >= ts.ScriptTarget.ES2022
}

export function tsCompilerOptionsToSwcConfig(options: ts.CompilerOptions, filename: string): Options {
  const isJsx = filename.endsWith('.tsx') || filename.endsWith('.jsx') || Boolean(options.jsx)
  const target = options.target ?? ts.ScriptTarget.ES2018
  return {
    module: toModule(options.module ?? ts.ModuleKind.ES2015),
    target: toTsTarget(target),
    jsx: isJsx,
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    sourcemap: options.sourceMap || options.inlineSourceMap ? 'inline' : Boolean(options.sourceMap),
    experimentalDecorators: options.experimentalDecorators ?? false,
    emitDecoratorMetadata: options.emitDecoratorMetadata ?? false,
    useDefineForClassFields: getUseDefineForClassFields(options, target),
    esModuleInterop: options.esModuleInterop ?? false,
    dynamicImport: true,
    keepClassNames: true,
    externalHelpers: Boolean(options.importHelpers),
    react:
      options.jsxFactory ?? options.jsxFragmentFactory ?? options.jsx ?? options.jsxImportSource
        ? {
            pragma: options.jsxFactory,
            pragmaFrag: options.jsxFragmentFactory,
            importSource: options.jsxImportSource ?? 'react',
            runtime: (options.jsx ?? 0) >= ts.JsxEmit.ReactJSX ? 'automatic' : 'classic',
            useBuiltins: true,
          }
        : undefined,
    baseUrl: options.baseUrl ? resolve(options.baseUrl) : undefined,
    paths: Object.fromEntries(
      Object.entries(options.paths ?? {}).map(([aliasKey, aliasPaths]) => [
        aliasKey,
        ((aliasPaths as string[]) ?? []).map((path) => resolve(options.baseUrl ?? './', path)),
      ]),
    ) as Options['paths'],
    ignoreDynamic: Boolean(process.env.SWC_NODE_IGNORE_DYNAMIC),
    swc: {
      sourceRoot: options.sourceRoot,
      inputSourceMap: options.inlineSourceMap,
    },
  }
}
