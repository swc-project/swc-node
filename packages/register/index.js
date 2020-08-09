const { transformSync } = require('@swc-node/core')
const { SourcemapMap, installSourceMapSupport } = require('@swc-node/sourcemap-support')
const { addHook } = require('pirates')
const ts = require('typescript')

const DEFAULT_EXTENSIONS = Object.freeze(['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx', '.d.ts'])

function toTsTarget(target) {
  switch (target) {
    case 'es3':
      return ts.ScriptTarget.ES3
    case 'es5':
      return ts.ScriptTarget.ES5
    case 'es2015':
      return ts.ScriptTarget.ES2015
    case 'es2016':
      return ts.ScriptTarget.ES2016
    case 'es2017':
      return ts.ScriptTarget.ES2017
    case 'es2018':
      return ts.ScriptTarget.ES2018
    case 'es2019':
      return ts.ScriptTarget.ES2019
    case 'es2020':
      return ts.ScriptTarget.ES2020
  }
}

function toModule(moduleKind) {
  switch (moduleKind) {
    case 'commonjs':
      return ts.ModuleKind.CommonJS
    case 'umd':
      return ts.ModuleKind.UMD
    case 'amd':
      return ts.ModuleKind.AMD
    case 'es6':
      return ts.ModuleKind.ES2015
  }
}

function compile(sourcecode, filename, options) {
  if (options && typeof options.fallbackToTs === 'function' && options.fallbackToTs(filename)) {
    const ts = require('typescript')
    const { outputText, sourceMapText } = ts.transpileModule(sourcecode, {
      fileName: filename,
      compilerOptions: {
        jsx: filename.endsWith('.tsx') || filename.endsWith('.jsx') ? ts.JsxEmit.React : ts.JsxEmit.None,
        experimentalDecorators: Boolean(options.experimentalDecorators),
        emitDecoratorMetadata: Boolean(options.emitDecoratorMetadata),
        module: toModule(options.module || 'commonjs'),
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        sourceMap: options.sourcemap === false,
        target: toTsTarget(options.target || 'es2018'),
        esModuleInterop: true,
      },
    })
    if (sourceMapText) {
      SourcemapMap.set(filename, sourceMapText)
    }
    return outputText
  } else {
    const { code, map } = transformSync(sourcecode, filename, options)
    SourcemapMap.set(filename, map)
    return code
  }
}

module.exports.register = function register(options = {}) {
  installSourceMapSupport()
  addHook((code, filename) => compile(code, filename, options), {
    exts: DEFAULT_EXTENSIONS,
  })
}
