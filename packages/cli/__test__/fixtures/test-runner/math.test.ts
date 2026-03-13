import assert from 'node:assert/strict'
import test from 'node:test'

import { add } from './math.ts'

test('adds numbers in TypeScript test file', () => {
  assert.equal(add(20, 22), 42)
})
