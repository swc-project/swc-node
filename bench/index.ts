import fs from 'fs'
import os from 'os'

import * as babel from '@babel/core'
// @ts-expect-error
import * as envPreset from '@babel/preset-env'
// @ts-expect-error
import * as tsPreset from '@babel/preset-typescript'
import { transformSync as transformSyncNapi, transform as transformNapi } from '@swc-node/core'
import Benchmark, { Suite } from 'benchmark'
import chalk from 'chalk'
import { transformSync as transformSyncEsbuild, transform as transformEsbuild } from 'esbuild'
import ts from 'typescript'

const cpuCount = os.cpus().length - 1

const syncSuite = new Suite('Transform rxjs/AjaxObservable.ts benchmark')

const asyncSuite = new Suite('Transform rxjs/AjaxObservable.ts async benchmark')

const parallelSuite = new Suite('Transform rxjs/AjaxObservable.ts parallel benchmark')

const SOURCE_PATH = require.resolve('rxjs/src/internal/observable/dom/AjaxObservable.ts')
const SOURCE_CODE = fs.readFileSync(SOURCE_PATH, 'utf-8')

async function run() {
  let defer: () => void
  const task = new Promise<void>((resolve) => {
    defer = resolve
  })

  syncSuite
    .add('@swc-node/core', () => {
      transformSyncNapi(SOURCE_CODE, SOURCE_PATH, {
        target: 'es2016',
        module: 'commonjs',
        sourcemap: true,
      })
    })
    .add('esbuild', () => {
      transformSyncEsbuild(SOURCE_CODE, {
        sourcefile: SOURCE_PATH,
        loader: 'ts',
        sourcemap: true,
        minify: false,
        target: 'es2016',
      })
    })
    .add('typescript', () => {
      ts.transpileModule(SOURCE_CODE, {
        fileName: SOURCE_PATH,
        compilerOptions: {
          target: ts.ScriptTarget.ES2016,
          module: ts.ModuleKind.CommonJS,
          isolatedModules: true,
          sourceMap: true,
        },
      })
    })
    .add('babel', () => {
      babel.transform(SOURCE_CODE, {
        filename: SOURCE_PATH,
        presets: [tsPreset, [envPreset, { targets: { node: 'current' }, modules: 'commonjs' }]],
        configFile: false,
        babelrc: false,
        sourceMaps: true,
      })
    })
    .on('cycle', function (event: Benchmark.Event) {
      console.info(String(event.target))
    })
    .on('complete', function (this: Benchmark.Target & Benchmark.Suite) {
      console.info(
        `${this.name} bench suite: Fastest is ${chalk.green(
          this.filter('fastest').map((s: Benchmark.Target) => s.name),
        )}`,
      )
      defer()
    })
    .run()

  await task
}

async function runAsync(parallel = 1, suite = asyncSuite) {
  let defer: () => void
  const task = new Promise<void>((resolve) => {
    defer = resolve
  })
  suite
    .add({
      name: '@swc-node/core',
      fn: (deferred: any) => {
        Promise.all(
          Array.from({ length: parallel }).map(() => {
            return transformNapi(SOURCE_CODE, SOURCE_PATH, {
              target: 'es2016',
              module: 'commonjs',
              sourcemap: true,
            })
          }),
        )
          .then(() => {
            deferred.resolve()
          })
          .catch((e) => {
            console.error(e)
          })
      },
      defer: true,
      async: true,
      queued: true,
    })
    .add({
      name: 'esbuild',
      fn: (deferred: any) => {
        Promise.all(
          Array.from({ length: parallel }).map(() =>
            transformEsbuild(SOURCE_CODE, {
              sourcefile: SOURCE_PATH,
              loader: 'ts',
              sourcemap: true,
              minify: false,
              target: 'es2016',
            }),
          ),
        )
          .then(() => {
            deferred.resolve()
          })
          .catch((e) => {
            console.error(e)
          })
      },
      defer: true,
      async: true,
      queued: true,
    })
    .on('cycle', function (event: Benchmark.Event) {
      event.target.hz = event.target!.hz! * parallel
      console.info(String(event.target))
    })
    .on('complete', function (this: Benchmark.Target & Benchmark.Suite) {
      console.info(
        `${this.name} bench suite: Fastest is ${chalk.green(
          this.filter('fastest').map((t: Benchmark.Target) => t.name),
        )}`,
      )
      defer()
    })
    .run()

  await task
}

run()
  .then(() => runAsync(cpuCount, parallelSuite))
  .catch(console.error)
