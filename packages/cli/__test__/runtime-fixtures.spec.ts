import { cp, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import test from 'ava'

import { runCli } from './helpers/run-cli'

const fixturesDir = join(__dirname, 'fixtures')

test('runs TypeScript entrypoint in esm-only project', (t) => {
  const result = runCli(['./index.ts'], {
    cwd: join(fixturesDir, 'esm-only'),
  })

  t.is(result.status, 0)
  t.is(result.stdout.trim(), 'esm-ok')
})

test('runs TypeScript entrypoint in cjs-only project', (t) => {
  const result = runCli(['./index.cts'], {
    cwd: join(fixturesDir, 'cjs-only'),
  })

  t.is(result.status, 0)
  t.is(result.stdout.trim(), 'cjs-ok')
})

test('runs mixed module graph project', (t) => {
  const result = runCli(['./index.mts'], {
    cwd: join(fixturesDir, 'mixed'),
  })

  t.is(result.status, 0)
  t.is(result.stdout.trim(), 'mixed-ok')
})

test('supports Node test runner with --test', (t) => {
  const result = runCli(['--test', './math.test.ts'], {
    cwd: join(fixturesDir, 'test-runner'),
  })

  t.is(result.status, 0)
  t.true(result.stderr.trim() === '' || !result.stderr.includes('REPL mode is not supported'))
  t.true(result.stdout.includes('adds numbers in TypeScript test file'))
})

test('runs non-erasable TypeScript syntax (enum + namespace)', (t) => {
  const result = runCli(['./index.ts'], {
    cwd: join(fixturesDir, 'non-erasable'),
  })

  t.is(result.status, 0)
  t.is(result.stdout.trim(), '42')
})

test('supports emitDecoratorMetadata from tsconfig', (t) => {
  const result = runCli(['./index.ts'], {
    cwd: join(fixturesDir, 'decorator-metadata'),
  })

  t.is(result.status, 0)
  t.is(result.stdout.trim(), 'metadata-ok')
})

test('works with regular node_modules packages', (t) => {
  const result = runCli(['./index.ts'], {
    cwd: join(fixturesDir, 'node-modules'),
  })

  t.is(result.status, 0)
  t.is(result.stdout.trim(), 'dep-ts-ok,dep-cts-ok,dep-cjs-ok')
})

test('supports mixed graph where cjs imports esm', (t) => {
  const result = runCli(['./index.cts'], {
    cwd: join(fixturesDir, 'cjs-imports-esm'),
  })

  t.is(result.status, 0)
  t.is(result.stdout.trim(), 'cjs-imports-esm-ok')
})

test('supports tsconfig paths from cwd tsconfig by default', (t) => {
  const result = runCli(['./index.ts'], {
    cwd: join(fixturesDir, 'tsconfig-paths'),
  })

  t.is(result.status, 0)
  t.is(result.stdout.trim(), 'paths-ok')
})

test('supports tsconfig paths with explicit --tsconfig', (t) => {
  const result = runCli(['--tsconfig', './tsconfig.json', './index.ts'], {
    cwd: join(fixturesDir, 'tsconfig-paths'),
  })

  t.is(result.status, 0)
  t.is(result.stdout.trim(), 'paths-ok')
})

test('auto-discovers TypeScript test file patterns with --test', (t) => {
  const result = runCli(['--test'], {
    cwd: join(fixturesDir, 'test-discovery'),
  })

  t.is(result.status, 0)
  t.true(result.stdout.includes('pattern-alpha.test.ts'))
  t.true(result.stdout.includes('pattern-beta-test.cts'))
  t.true(result.stdout.includes('pattern-gamma_test.mts'))
  t.true(result.stdout.includes('pattern-test-delta.ts'))
  t.true(result.stdout.includes('pattern-test.ts'))
  t.true(result.stdout.includes('pattern-test/epsilon.ts'))
  t.false(result.stdout.includes('nonmatch.ts should not be discovered'))
})

test.serial('works when cwd does not have @swc-node/register installed', async (t) => {
  const sourceDir = join(fixturesDir, 'esm-only')
  const tempDir = await mkdtemp(join(tmpdir(), 'swc-node-cli-no-register-'))

  try {
    await cp(sourceDir, tempDir, { recursive: true })

    const result = runCli(['./index.ts'], {
      cwd: tempDir,
    })

    t.is(result.status, 0)
    t.is(result.stdout.trim(), 'esm-ok')
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})
