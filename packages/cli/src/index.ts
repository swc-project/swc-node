import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const spawn = require('cross-spawn') as typeof import('cross-spawn')

import { parseCliArgs } from './cli-args'
import { printHelp, printReplNotSupported, printVersion } from './cli-output'

const pkgJson = require('../package.json')

const localCjsRegisterPath = resolve(__dirname, '..', 'register-cjs.js')
const localEsmRegisterPath = resolve(__dirname, '..', 'register-esm.js')
const localEsmRegisterUrl = pathToFileURL(localEsmRegisterPath).toString()

const swcArgs = parseCliArgs(process.argv.slice(2))

if (swcArgs.version) {
  printVersion(pkgJson.version)
  process.exit(0)
}

if (swcArgs.help) {
  printHelp(pkgJson.version)
  process.exit(0)
}

if (swcArgs.repl) {
  printReplNotSupported()
  printHelp(pkgJson.version)
  process.exit(1)
}

// Install both hooks at process boot so swc-node works in mixed module graphs
// (ESM entrypoints importing CJS, or CJS requiring TS) without brittle mode detection.
const result = spawn.sync(
  process.execPath,
  ['--enable-source-maps', '-r', localCjsRegisterPath, '--import', localEsmRegisterUrl, ...swcArgs.argv],
  {
    stdio: 'inherit',
    env: swcArgs.tsconfigPath
      ? {
          ...process.env,
          SWC_NODE_PROJECT: swcArgs.tsconfigPath,
        }
      : process.env,
  },
)

if (result.error) {
  throw result.error
}

if (result.signal) {
  // Mirror child signal termination in the wrapper process. This preserves
  // expected shell/CI behavior for SIGINT/SIGTERM instead of masking as exit code.
  process.kill(process.pid, result.signal)
} else {
  process.exit(result.status ?? 1)
}
