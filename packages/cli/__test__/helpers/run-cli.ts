import { spawn, spawnSync, type ChildProcess, type SpawnOptions, type SpawnSyncReturns } from 'node:child_process'
import { resolve } from 'node:path'

interface RunCliOptions {
  cwd?: string
  env?: NodeJS.ProcessEnv
}

interface SpawnCliOptions extends RunCliOptions {
  stdio?: SpawnOptions['stdio']
  detached?: boolean
}

const entry = resolve(__dirname, '..', '..', 'src', 'index.ts')
const registerPath = require.resolve('@swc-node/register')

export function runCli(args: string[], options: RunCliOptions = {}): SpawnSyncReturns<string> {
  const env = createCleanEnv(options.env)

  return spawnSync(process.execPath, ['-r', registerPath, entry, ...args], {
    cwd: options.cwd,
    env,
    encoding: 'utf8',
  })
}

export function spawnCli(args: string[], options: SpawnCliOptions = {}): ChildProcess {
  const env = createCleanEnv(options.env)

  return spawn(process.execPath, ['-r', registerPath, entry, ...args], {
    cwd: options.cwd,
    env,
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
    detached: options.detached,
  })
}

function createCleanEnv(overrides?: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const env = {
    ...process.env,
  }

  delete env.SWC_NODE_PROJECT
  delete env.TS_NODE_PROJECT

  return {
    ...env,
    ...overrides,
  }
}
