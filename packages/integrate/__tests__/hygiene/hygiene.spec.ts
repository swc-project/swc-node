import test from 'ava'

import { HygieneTest } from './class'

test('hygiene constructor variable', (t) => {
  const DURATION = 1000
  const a = new HygieneTest()
  t.is(a.getDuration(), DURATION)
})
