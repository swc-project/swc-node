import test from 'ava'

import { runCli } from './helpers/run-cli'

const { version } = require('../package.json') as { version: string }

test('prints version', (t) => {
  const result = runCli(['--version'])

  t.is(result.status, 0)
  t.is(result.stdout.trim(), version)
})

test('prints help with cli custom flags', (t) => {
  const result = runCli(['--help'])

  t.is(result.status, 0)
  t.true(result.stdout.includes('--tsconfig <path>'))
  t.false(result.stdout.includes('-P, --project'))
})

test('supports TypeScript eval', (t) => {
  const result = runCli(['-e', 'const n: number = 1; console.log(n + 1)'])

  t.is(result.status, 0)
  t.is(result.stdout.trim(), '2')
})

test('supports TypeScript print expression', (t) => {
  const result = runCli(['-p', 'const n: number = 41; n + 1'])

  t.is(result.status, 0)
  t.is(result.stdout.trim(), '42')
})

test('supports inline --eval= and --print= forms', (t) => {
  const evalResult = runCli(['--eval=const n: number = 1; console.log(n + 2)'])
  t.is(evalResult.status, 0)
  t.is(evalResult.stdout.trim(), '3')

  const printResult = runCli(['--print=const n: number = 41; n + 1'])
  t.is(printResult.status, 0)
  t.is(printResult.stdout.trim(), '42')
})

test('supports --tsconfig and SWC_NODE_PROJECT for project selection', (t) => {
  const configPath = './packages/register/tsconfig.json'

  const fromFlag = runCli(['--tsconfig', configPath, '-e', 'console.log(process.env.SWC_NODE_PROJECT)'])
  t.is(fromFlag.status, 0)
  t.is(fromFlag.stdout.trim(), configPath)

  const fromEnv = runCli(['-e', 'console.log(process.env.SWC_NODE_PROJECT)'], {
    env: { SWC_NODE_PROJECT: configPath },
  })
  t.is(fromEnv.status, 0)
  t.is(fromEnv.stdout.trim(), configPath)
})

test('blocks REPL mode when no entrypoint is provided', (t) => {
  const result = runCli([])

  t.is(result.status, 1)
  t.true(result.stderr.includes('REPL mode is not supported'))
  t.true(result.stdout.includes('Usage:'))
})
