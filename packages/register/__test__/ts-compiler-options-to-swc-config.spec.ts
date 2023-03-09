import { join } from 'path'

import test from 'ava'
import * as ts from 'typescript'

import { tsCompilerOptionsToSwcConfig } from '../read-default-tsconfig'

test('default values', (t) => {
  const options: ts.CompilerOptions = {}
  const filename = 'some-file.tsx'
  const swcConfig = tsCompilerOptionsToSwcConfig(options, filename)
  const expected = {
    module: 'es6',
    sourcemap: false,
    experimentalDecorators: false,
    emitDecoratorMetadata: false,
    esModuleInterop: false,
    swc: {
      filename,
      inputSourceMap: undefined,
      sourceRoot: undefined,
      jsc: {
        externalHelpers: false,
        parser: {
          syntax: 'typescript',
          tsx: true,
          dynamicImport: true,
          decorators: undefined,
        },
        paths: {},
        keepClassNames: true,
        target: 'es2018',
        transform: {
          decoratorMetadata: undefined,
          legacyDecorator: undefined,
          react: undefined,
        },
      },
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
    swc: {
      filename,
      jsc: {
        parser: {
          decorators: true,
        },
        transform: {
          decoratorMetadata: true,
          legacyDecorator: true,
        },
      },
    },
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
    swc: {
      filename,
      jsc: {
        parser: {
          tsx: true,
        },
        transform: {
          react: {
            pragma: options.jsxFactory,
            pragmaFrag: options.jsxFragmentFactory,
            importSource: 'react',
            runtime: 'automatic',
            useBuiltins: true,
          },
        },
      },
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
    module: 'commonjs',
    sourcemap: options.sourceMap,
    experimentalDecorators: options.experimentalDecorators,
    emitDecoratorMetadata: options.emitDecoratorMetadata,
    esModuleInterop: options.esModuleInterop,
    swc: {
      filename,
      inputSourceMap: options.inlineSourceMap,
      sourceRoot: options.sourceRoot,
      jsc: {
        externalHelpers: options.importHelpers,
        parser: {
          syntax: 'typescript',
          tsx: true,
          dynamicImport: true,
          decorators: options.experimentalDecorators,
        },
        paths: {
          '@test': [join(__dirname, './specific-path-1/test')],
          '@another': [join(__dirname, './specific-path-2/another')],
        },
        keepClassNames: true,
        target: 'es5',
        transform: {
          decoratorMetadata: options.emitDecoratorMetadata,
          legacyDecorator: options.experimentalDecorators,
          react: {
            pragma: options.jsxFactory,
            pragmaFrag: options.jsxFragmentFactory,
            importSource: options.jsxImportSource,
            runtime: 'classic',
            useBuiltins: true,
          },
        },
      },
    },
  }
  t.deepEqual(swcConfig, expected)
})
