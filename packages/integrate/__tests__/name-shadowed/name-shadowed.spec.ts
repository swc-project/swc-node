import test from 'ava'

import { setup } from './shadowed'

test('shadowed name spec', (t) => {
  const url = '/a/b/c'
  const qs = {
    foo: '1',
    bar: '2',
  }
  t.is(setup(url, qs), url + '?' + 'foo=1&bar=2')
})
