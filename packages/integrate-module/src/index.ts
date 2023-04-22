/* eslint import/order: off */
import assert from 'node:assert'
import test from 'node:test'

import { supportedExtensions } from 'file-type'

import { foo } from './foo.mjs'
import { bar } from './subdirectory/bar.mjs'

await test('file-type should work', () => {
  assert.ok(supportedExtensions.has('jpg'))
})

await test('resolve adjacent file path', () => {
  assert.equal(foo(), 'foo')
})

await test('resolve nested file path', () => {
  assert.equal(bar(), 'bar')
})
