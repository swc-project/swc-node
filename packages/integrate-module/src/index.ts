/* eslint import/order: off */
import assert from 'node:assert'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { RepositoryState } from '@napi-rs/simple-git'
import { bar as subBar } from '@subdirectory/bar.mjs'
import { name } from '@swc-node/test-conditions'
import esmock from 'esmock'
import { supportedExtensions } from 'file-type'
import { renderToString } from 'react-dom/server'
import { simpleGit } from 'simple-git'
import ipaddr from 'ipaddr.js'
import postgres from 'postgres'

import { CompiledClass } from './compiled.js'
import cjs from './cjs'
import { foo } from './foo.mjs'
import { bar } from './subdirectory/bar.mjs'
import { baz } from './subdirectory/index.mjs'
import { Component } from './component.js'
import { common } from './common.cjs'
import './js-module.mjs'
import pgkJson from '../package.json' assert { type: 'json' }
import pgkJsonWith from '../package.json' with { type: 'json' }

const { foo: fooWithQuery } = await import(`./foo.mjs?q=${Date.now()}`)

await test('file-type should work', () => {
  assert.ok(supportedExtensions.has('jpg'))
})

await test('resolve adjacent file path', () => {
  assert.equal(foo(), 'foo')
})

await test('resolve nested file path', () => {
  assert.equal(bar(), 'bar')
})

await test('resolve nested entry point', () => {
  assert.equal(baz(), 'baz')
})

await test('resolve paths', () => {
  assert.equal(subBar(), 'bar')
})

await test('resolve with query', () => {
  assert.equal(fooWithQuery(), 'foo')
})

await test('compiled js file with .d.ts', () => {
  const instance = new CompiledClass()
  assert.equal(instance.name, 'CompiledClass')
})

await test('jsx should work', () => {
  assert.equal(renderToString(Component()), '<div>Component</div>')
})

await test('resolve @napi-rs projects', () => {
  assert.equal(RepositoryState.ApplyMailbox, 10)
})

await test('resolve simple-git', () => {
  assert.ok(simpleGit)
})

await test('resolve local cjs module', () => {
  assert.equal(cjs.default(), 'default.default')
})

await test('resolve commonjs module', () => {
  assert.equal(common, 'common')
})

await test('resolve json file', () => {
  assert.equal(pgkJson.name, 'integrate-module')
  assert.equal(pgkJsonWith.name, 'integrate-module')
})

await test('resolve ipaddr.js', () => {
  assert.ok(ipaddr.isValid('192.168.1.1'))
})

await test('esmock should work', async () => {
  const main = await esmock('./mocked.ts', {
    path: {
      basename: () => 'hello',
    },
  })

  assert.strictEqual(main.pathbasenamewrap(), 'hello')
})

await test('postgres should work', async () => {
  postgres({
    host: 'postgres://localhost',
  })
})

await test('resolve conditions', () => {
  assert.equal(name, 'from-dev')
})

// `with { type: 'text' }` is supported since Node.js 26.5, behind --experimental-import-text
const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number)
const supportsTextImports = nodeMajor > 26 || (nodeMajor === 26 && nodeMinor >= 5)

await test('text import attributes should pass through to the default loader', { skip: !supportsTextImports }, () => {
  const { status, stderr } = spawnSync(
    process.execPath,
    [
      '--experimental-import-text',
      '--import=@swc-node/register/esm-register',
      fileURLToPath(new URL('./text-import/index.ts', import.meta.url)),
    ],
    { env: process.env },
  )

  assert.equal(status, 0, stderr?.toString())
})
