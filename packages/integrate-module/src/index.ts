/* eslint import/order: off */
import assert from 'node:assert'
import test from 'node:test'

import { RepositoryState } from '@napi-rs/simple-git'
import { bar as subBar } from '@subdirectory/bar.mjs'
import { supportedExtensions } from 'file-type'
import { renderToString } from 'react-dom/server'
import { simpleGit } from 'simple-git'

import { CompiledClass } from './compiled.js'
import cjs from './cjs'
import { foo } from './foo.mjs'
import { bar } from './subdirectory/bar.mjs'
import { baz } from './subdirectory/index.mjs'
import { Component } from './component.js'
import { common } from './common.cjs'
import './js-module.mjs'

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
