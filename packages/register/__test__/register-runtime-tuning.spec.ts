import test from 'ava'
import sinon from 'sinon'
import * as ts from 'typescript'

import * as swcCore from '@swc-node/core'
import { SourcemapMap } from '@swc-node/sourcemap-support'

import { clearTransformCache, compile } from '../register'
import { clearTransformCacheForTest } from '../transform-cache'

const originalEnv = { ...process.env }
const emptyMap = '{"version":3,"sources":[],"names":[],"mappings":""}'

function uniquePath(label: string, extension: string) {
  return `/tmp/${label}-${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`
}

test.beforeEach(() => {
  process.env.SWC_NODE_CACHE_DIR = `/tmp/swc-node-test-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`
})

test.afterEach.always(() => {
  sinon.restore()
  SourcemapMap.clear()
  clearTransformCache({ memory: true, disk: false })
  process.env = { ...originalEnv }
})

test.serial('reuses transform cache for sync compile', (t) => {
  const transformSyncStub = sinon.stub(swcCore, 'transformSync').returns({
    code: 'console.log("cached")',
    map: emptyMap,
  })

  const filename = uniquePath('cache-sync', 'ts')
  const source = `const value: number = ${Date.now()}`

  const first = compile(source, filename, {
    module: ts.ModuleKind.CommonJS,
    sourceMap: true,
  })
  const second = compile(source, filename, {
    module: ts.ModuleKind.CommonJS,
    sourceMap: true,
  })

  t.is(first, second)
  t.is(transformSyncStub.callCount, 1)
})

test.serial('reuses transform cache for async compile', async (t) => {
  const transformStub = sinon.stub(swcCore, 'transform').resolves({
    code: 'console.log("cached-async")',
    map: emptyMap,
  })

  const filename = uniquePath('cache-async', 'ts')
  const source = `const value: number = ${Date.now()}`

  const first = await compile(
    source,
    filename,
    {
      module: ts.ModuleKind.ESNext,
      sourceMap: true,
    },
    true,
  )
  const second = await compile(
    source,
    filename,
    {
      module: ts.ModuleKind.ESNext,
      sourceMap: true,
    },
    true,
  )

  t.is(first, second)
  t.true(transformStub.callCount <= 1)
})

test.serial('supports sourcemap inline-only mode to reduce map-store memory', (t) => {
  process.env.SWC_NODE_SOURCE_MAP_MODE = 'inline'

  sinon.stub(swcCore, 'transformSync').returns({
    code: 'console.log("inline-only")',
    map: emptyMap,
  })

  const filename = uniquePath('sourcemap-inline', 'ts')
  const output = compile('const x = 1', filename, {
    module: ts.ModuleKind.CommonJS,
    sourceMap: true,
  })

  t.true(output.includes('sourceMappingURL'))
  t.false(SourcemapMap.has(filename))
})

test.serial('supports sourcemap store-only mode to avoid inline map payload', (t) => {
  process.env.SWC_NODE_SOURCE_MAP_MODE = 'store'

  sinon.stub(swcCore, 'transformSync').returns({
    code: 'console.log("store-only")',
    map: emptyMap,
  })

  const filename = uniquePath('sourcemap-store', 'ts')
  const output = compile('const x = 1', filename, {
    module: ts.ModuleKind.CommonJS,
    sourceMap: true,
  })

  t.false(output.includes('sourceMappingURL'))
  t.true(SourcemapMap.has(filename))
})

test.serial('skips transform for plain js in commonjs mode', (t) => {
  const transformSyncStub = sinon.stub(swcCore, 'transformSync')

  const output = compile('module.exports = 42', uniquePath('plain-cjs', 'js'), {
    module: ts.ModuleKind.CommonJS,
    sourceMap: true,
  })

  t.is(output, 'module.exports = 42')
  t.false(transformSyncStub.called)
})

test.serial('still transforms js with esm syntax in commonjs mode', (t) => {
  const transformSyncStub = sinon.stub(swcCore, 'transformSync').returns({
    code: 'exports.value = 42',
    map: emptyMap,
  })

  const output = compile('export const value = 42', uniquePath('esm-in-js', 'js'), {
    module: ts.ModuleKind.CommonJS,
    sourceMap: true,
  })

  t.true(output.includes('exports.value = 42'))
  t.true(transformSyncStub.calledOnce)
})

test.serial('skips transform for runtime js in esm mode', async (t) => {
  const transformStub = sinon.stub(swcCore, 'transform')

  const output = await compile(
    'export const value = 42',
    uniquePath('plain-esm', 'mjs'),
    {
      module: ts.ModuleKind.ESNext,
      sourceMap: true,
    },
    true,
  )

  t.is(output, 'export const value = 42')
  t.false(transformStub.called)
})

test.serial('can clear transform cache programmatically', (t) => {
  const transformSyncStub = sinon.stub(swcCore, 'transformSync').returns({
    code: 'console.log("clear-cache")',
    map: emptyMap,
  })

  const filename = uniquePath('clear-cache', 'ts')
  const options = {
    module: ts.ModuleKind.CommonJS,
    sourceMap: true,
  }

  compile('const value: number = 1', filename, options)
  compile('const value: number = 1', filename, options)
  t.is(transformSyncStub.callCount, 1)

  clearTransformCache({ memory: true, disk: true })

  compile('const value: number = 1', filename, options)
  t.is(transformSyncStub.callCount, 2)
})
