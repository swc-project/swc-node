import { createRequire } from 'node:module'

import test from 'ava'
import sinon from 'sinon'
import * as ts from 'typescript'

import { SourcemapMap } from '@swc-node/sourcemap-support'

import { compile } from '../lib/register.js'
import { clearTransformCache } from '../lib/transform-cache.js'

// @swc-node/core is CommonJS. Import it through require so this test holds the
// exact same singleton that ../lib/register.js loads internally; an ESM `import
// * as` namespace is frozen and cannot be stubbed. Stubbing the singleton's
// transform functions is then observed by the compile() calls under test.
const require = createRequire(import.meta.url)
const swcCore = require('@swc-node/core')

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

test.serial('transforms jsx in a .js file when jsx is configured (commonjs)', (t) => {
  const transformSyncStub = sinon.stub(swcCore, 'transformSync').returns({
    code: 'h("div", null, "hi")',
    map: emptyMap,
  })

  const output = compile('const view = () => <div>hi</div>', uniquePath('jsx-cjs', 'js'), {
    module: ts.ModuleKind.CommonJS,
    sourceMap: true,
    jsx: ts.JsxEmit.React,
  })

  t.true(output.includes('h("div"'))
  t.true(transformSyncStub.calledOnce)
})

test.serial('transforms jsx in a .js file in esm mode instead of skipping', async (t) => {
  const transformStub = sinon.stub(swcCore, 'transform').resolves({
    code: 'h("div", null, "hi")',
    map: emptyMap,
  })

  const output = await compile(
    'export const view = () => <div>hi</div>',
    uniquePath('jsx-esm', 'js'),
    {
      module: ts.ModuleKind.ESNext,
      sourceMap: true,
      jsx: ts.JsxEmit.React,
    },
    true,
  )

  t.true(output.includes('h("div"'))
  t.true(transformStub.calledOnce)
})

test.serial('does not skip a .js file whose content looks like jsx even without jsx config', (t) => {
  const transformSyncStub = sinon.stub(swcCore, 'transformSync').returns({
    code: 'compiled',
    map: emptyMap,
  })

  // A closing tag `</div>` alone is a strong JSX signal and must block the skip.
  compile('const view = () => <div>hi</div>', uniquePath('jsx-content', 'js'), {
    module: ts.ModuleKind.CommonJS,
    sourceMap: true,
  })

  t.true(transformSyncStub.calledOnce)
})

test.serial('async compile returns a Promise even on a warm cache hit', async (t) => {
  sinon.stub(swcCore, 'transform').resolves({
    code: 'console.log("async-contract")',
    map: emptyMap,
  })

  const filename = uniquePath('async-contract', 'ts')
  const source = `const value: number = ${Date.now()}`
  const options = { module: ts.ModuleKind.ESNext, sourceMap: true }

  const cold = compile(source, filename, { ...options }, true)
  t.is(typeof (cold as Promise<string>).then, 'function')
  await cold

  // Warm hit previously returned a bare string, breaking `.then()` callers.
  const warm = compile(source, filename, { ...options }, true)
  t.is(typeof (warm as Promise<string>).then, 'function')
  t.is(typeof (await warm), 'string')
})
