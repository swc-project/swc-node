/* eslint import/order: off */
import assert from 'node:assert'
import test from 'node:test'

import { supportedExtensions } from 'file-type'

await test('file-type should work', () => {
  assert.ok(supportedExtensions.has('jpg'))
})
