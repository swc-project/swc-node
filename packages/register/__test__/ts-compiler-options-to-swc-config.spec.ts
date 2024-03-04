import { join } from 'path'

import test from 'ava'
import * as ts from 'typescript'

import { tsCompilerOptionsToSwcConfig } from '../read-default-tsconfig'

test('default values', (t) => {
  const options: ts.CompilerOptions = {}
  const filename = 'some-file.tsx'
  const swcConfig = tsCompilerOptionsToSwcConfig(options, filename)
  const expected = {
    baseUrl: undefined,
    module: 'es6',
    sourcemap: false,
    experimentalDecorators: false,
    emitDecoratorMetadata: false,
    useDefineForClassFields: false,
    esModuleInterop: false,
    dynamicImport: true,
    externalHelpers: false,
    ignoreDynamic: false,
    jsx: true,
    paths: {},
    keepClassNames: true,
    target: 'es2018',
    react: undefined,
    swc: {
      inputSourceMap: undefined,
      sourceRoot: undefined,
    },
  }
  t.deepEqual(swcConfig, expected)
})

test('should set the decorator config', (t) => {
  const options: ts.CompilerOptions = {
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
  }
  const filename = 'some-file.ts'
  const swcConfig = tsCompilerOptionsToSwcConfig(options, filename)
  const expected = {
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
  }
  t.like(swcConfig, expected)
})

test('should force the jsx  config', (t) => {
  const options: ts.CompilerOptions = {
    jsx: ts.JsxEmit.ReactJSX,
  }
  const filename = 'some-file.ts'
  const swcConfig = tsCompilerOptionsToSwcConfig(options, filename)
  const expected = {
    module: 'es6',
    jsx: true,
    react: {
      pragma: options.jsxFactory,
      pragmaFrag: options.jsxFragmentFactory,
      importSource: 'react',
      runtime: 'automatic',
      useBuiltins: true,
    },
    swc: {
      inputSourceMap: undefined,
      sourceRoot: undefined,
    },
  }
  t.like(swcConfig, expected)
})

test('should set all values', (t) => {
  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES5,
    sourceMap: true,
    esModuleInterop: true,
    inlineSourceMap: true,
    sourceRoot: 'source-root',
    importHelpers: true,
    jsx: ts.JsxEmit.None,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    paths: {
      '@test': ['./specific-path-1/test'],
      '@another': ['./specific-path-2/another'],
    },
    jsxFactory: 'jsx-factory',
    jsxFragmentFactory: 'jsx-fragment-factory',
    jsxImportSource: 'jsx-import-source',
    baseUrl: './packages/register/__test__',
  }
  const filename = 'some-file.tsx'
  const swcConfig = tsCompilerOptionsToSwcConfig(options, filename)
  const expected = {
    baseUrl: join(process.cwd(), options.baseUrl!),
    module: 'commonjs',
    sourcemap: 'inline',
    target: 'es5',
    experimentalDecorators: options.experimentalDecorators,
    emitDecoratorMetadata: options.emitDecoratorMetadata,
    useDefineForClassFields: false,
    esModuleInterop: options.esModuleInterop,
    externalHelpers: true,
    ignoreDynamic: false,
    dynamicImport: true,
    keepClassNames: true,
    jsx: true,
    react: {
      pragma: options.jsxFactory,
      pragmaFrag: options.jsxFragmentFactory,
      importSource: options.jsxImportSource,
      runtime: 'classic',
      useBuiltins: true,
    },
    paths: {
      '@test': [join(__dirname, './specific-path-1/test')],
      '@another': [join(__dirname, './specific-path-2/another')],
    },
    swc: {
      inputSourceMap: options.inlineSourceMap,
      sourceRoot: options.sourceRoot,
    },
  }
  t.deepEqual(swcConfig, expected)
})
