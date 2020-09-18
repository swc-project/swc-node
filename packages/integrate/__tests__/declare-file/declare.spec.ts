import test from 'ava'

import { Foo } from './declare'

test('should handle declare file', (t) => {
  const fixture = 42
  const foo: typeof Foo = () => fixture

  t.is(foo(), fixture)
})
