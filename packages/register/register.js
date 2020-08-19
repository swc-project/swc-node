/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
const { existsSync } = require('fs')
const { join, parse } = require('path')

const { transformSync } = require('@swc-node/core')
const { SourcemapMap, installSourceMapSupport } = require('@swc-node/sourcemap-support')
const debug = require('debug')('@swc-node')
const { addHook } = require('pirates')
const ts = require('typescript')

const DEFAULT_EXTENSIONS = Object.freeze(['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx', '.d.ts'])

/**
 * @param {import('typescript').ScriptTarget} target
 */
function toTsTarget(target) {
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

/**
 * @param {import('typescript').ModuleKind} moduleKind
 */
function toModule(moduleKind) {
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

/**
 * @param {string} sourcecode
 * @param {string} filename
 * @param {import('typescript').CompilerOptions} options
 */
function compile(sourcecode, filename, options) {
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
      target: toTsTarget(options.target || ts.ScriptTarget.ES2018),
      module: toModule(options.module || ts.ModuleKind.ES2015),
      sourcemap: options.sourceMap === false,
      jsx: filename.endsWith('.tsx') || filename.endsWith('.jsx') || (options.jsx && options.jsx !== ts.JsxEmit.None),
      experimentalDecorators: options.experimentalDecorators || false,
      emitDecoratorMetadata: options.emitDecoratorMetadata || false,
      dynamicImport: options.module && options.module >= ts.ModuleKind.ES2020,
    })
    SourcemapMap.set(filename, map)
    return code
  }
}

function readDefaultTsConfig() {
  const tsConfigPath =
    process.env.SWC_NODE_PROJECT || process.env.TS_NODE_PROJECT || join(process.cwd(), 'tsconfig.json')

  /**@type {import('typescript').CompilerOptions} */
  let compilerOptions = {
    target: ts.ScriptTarget.ES2018,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    jsx: false,
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

module.exports.register = function register(options = readDefaultTsConfig()) {
  installSourceMapSupport()
  addHook((code, filename) => compile(code, filename, options), {
    exts: DEFAULT_EXTENSIONS,
  })
}
