/* eslint import/order: off */
import assert from 'node:assert'
import test from 'node:test'

import { supportedExtensions } from 'file-type'

import { foo } from './foo.mts'
import { bar } from './subdirectory/bar.mts'
import { baz } from './subdirectory/index.mts'
import { bar as subBar } from '@subdirectory/bar.mts'

await test('js:file-type should work', () => {
  assert.ok(supportedExtensions.has('jpg'))
})

await test('js:resolve adjacent file path', () => {
  assert.equal(foo(), 'foo')
})

await test('js:resolve nested file path', () => {
  assert.equal(bar(), 'bar')
})

await test('js:resolve nested entry point', () => {
  assert.equal(baz(), 'baz')
})

await test('js:resolve paths', () => {
  assert.equal(subBar(), 'bar')
})
