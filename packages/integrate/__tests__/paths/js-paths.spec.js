import { FIXTURE } from '@integrate/fixture'
import test from 'ava'

test('js should transpile paths', (t) => {
  t.is(FIXTURE, 'fixture')
})
