/* eslint import/order: off */
import assert from 'node:assert'
import test from 'node:test'

import { supportedExtensions } from 'file-type'

import { CompiledClass } from './compiled.js'
import { foo } from './foo.mjs'
import { bar } from './subdirectory/bar.mjs'
import { baz } from './subdirectory/index.mjs'
import { bar as subBar } from '@subdirectory/bar.mjs'
import './js-module.mjs'

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

await test('compiled js file with .d.ts', () => {
  const instance = new CompiledClass()
  assert.equal(instance.name, 'CompiledClass')
})
