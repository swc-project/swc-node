const fs = require('fs')

const { transformSync: transformSyncNapi } = require('@swc-node/core')
const { transformSync } = require('@swc/core')
const { Suite } = require('benchmark')
const chalk = require('chalk')
const { transformSync: transformSyncEsbuild, startService } = require('esbuild')
const ts = require('typescript')

const suite = new Suite('Transform rxjs/AjaxObservable.ts benchmark')

const SOURCE_PATH = require.resolve('rxjs/src/internal/observable/dom/AjaxObservable.ts')
const SOURCE_CODE = fs.readFileSync(SOURCE_PATH, 'utf-8')

async function run() {
  const service = await startService()

  suite
    .add('@swc/core', () => {
      transformSync(SOURCE_CODE, {
        filename: SOURCE_PATH,
        jsc: {
          target: 'es2015',
          parser: {
            syntax: 'typescript',
          },
        },
        module: {
          type: 'commonjs',
        },
      })
    })
    .add('@swc-node/core', () => {
      transformSyncNapi(SOURCE_CODE, SOURCE_PATH, {
        target: 'es2015',
        module: 'commonjs',
      })
    })
    .add('esbuild', () => {
      transformSyncEsbuild(SOURCE_CODE, {
        sourcefile: SOURCE_PATH,
        loader: 'ts',
        sourcemap: true,
        minify: false,
        target: 'es2015',
      })
    })
    .add('typescript', () => {
      ts.transpileModule(SOURCE_CODE, {
        fileName: SOURCE_PATH,
        compilerOptions: {
          target: ts.ScriptTarget.ES2015,
          module: ts.ModuleKind.CommonJS,
          isolatedModules: true,
          sourceMap: true,
        },
      })
    })
    .on('cycle', function (event) {
      console.info(String(event.target))
    })
    .on('complete', function () {
      console.info(`${this.name} bench suite: Fastest is ${chalk.green(this.filter('fastest').map('name'))}`)
      service.stop()
    })
    .run()
}

run().catch(console.error)
