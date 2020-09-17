import test from 'ava'

import * as D from './declare'

test('should handle declare file', (t) => {
  const fixture = 42
  const foo: typeof D.Foo = () => fixture

  t.is(foo(), fixture)
})
