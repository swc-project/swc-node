import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

import { bench, boxplot, run } from 'mitata'

const rootDir = resolve(__dirname, '..')
const fixtureDir = resolve(__dirname, 'fixture')
const fixtureTsconfig = resolve(fixtureDir, 'tsconfig.json')

const tsxCli = require.resolve('tsx/cli')
const swcNodeCli = resolve(rootDir, 'packages', 'cli', 'index.js')
const cacheRoot = resolve(rootDir, 'bench', '.cache')
const swcCacheDir = resolve(cacheRoot, 'swc-node')
const tsxTmpDir = resolve(cacheRoot, 'tmp')

const workloads = [
  {
    name: 'rxjs',
    entrypoint: resolve(fixtureDir, 'rxjs.ts'),
  },
  {
    name: 'typescript',
    entrypoint: resolve(fixtureDir, 'ts.ts'),
  },
] as const

type RunMode = 'cached' | 'uncached'

type Runner = {
  name: 'tsx' | 'swc-node' | 'node'
  cliFile: string
  envForMode?: (mode: RunMode) => NodeJS.ProcessEnv
}

const runners: Runner[] = [
  {
    name: 'node',
    cliFile: '', // Use node directly without a CLI wrapper
  },
  {
    name: 'tsx',
    cliFile: tsxCli,
    envForMode: (mode) => ({
      ...process.env,
      TMPDIR: tsxTmpDir,
      TSX_DISABLE_CACHE: mode === 'uncached' ? '1' : '0',
    }),
  },
  {
    name: 'swc-node',
    cliFile: swcNodeCli,
    envForMode: (mode) => ({
      ...process.env,
      SWC_NODE_PROJECT: fixtureTsconfig,
      SWC_NODE_CACHE_DIR: swcCacheDir,
      SWC_NODE_CACHE: mode === 'uncached' ? '0' : '1',
    }),
  },
]

function runCli(name: string, cliFile: string, entrypoint: string, env: NodeJS.ProcessEnv) {
  const result = spawnSync(process.execPath, [cliFile, entrypoint].filter(Boolean), {
    cwd: fixtureDir,
    env,
    stdio: 'pipe',
    encoding: 'utf8',
  })

  if (result.status !== 0) {
    const stderr = result.stderr?.trim() || '(empty stderr)'
    throw new Error(`${name} failed with exit code ${result.status}: ${stderr}`)
  }
}

function resetCacheDirectories() {
  fs.rmSync(cacheRoot, { recursive: true, force: true })
  fs.mkdirSync(swcCacheDir, { recursive: true })
  fs.mkdirSync(tsxTmpDir, { recursive: true })
}

resetCacheDirectories()

for (const workload of workloads) {
  for (const runner of runners) {
    if (runner.envForMode) {
      runCli(
        `${runner.name} (${workload.name}, cached prewarm)`,
        runner.cliFile,
        workload.entrypoint,
        runner.envForMode('cached'),
      )
      runCli(
        `${runner.name} (${workload.name}, uncached preflight)`,
        runner.cliFile,
        workload.entrypoint,
        runner.envForMode('uncached'),
      )
    } else {
      runCli(`${runner.name} (${workload.name},preflight)`, runner.cliFile, workload.entrypoint, process.env)
    }
  }
}

boxplot(() => {
  for (const workload of workloads) {
    for (const runner of runners) {
      if (runner.envForMode) {
        bench(`${runner.name} uncached (${workload.name})`, () =>
          runCli(
            `${runner.name} uncached (${workload.name})`,
            runner.cliFile,
            workload.entrypoint,
            runner.envForMode!('uncached'),
          ),
        )

        bench(`${runner.name} cached (${workload.name})`, () =>
          runCli(
            `${runner.name} cached (${workload.name})`,
            runner.cliFile,
            workload.entrypoint,
            runner.envForMode!('cached'),
          ),
        ).baseline(runner.name === 'node')
      } else {
        bench(`${runner.name} (${workload.name})`, () =>
          runCli(`${runner.name} (${workload.name})`, runner.cliFile, workload.entrypoint, process.env),
        ).baseline(runner.name === 'node')
      }
    }
  }
})

run({ throw: true }).catch((error) => {
  console.error(error)
  process.exitCode = 1
})
