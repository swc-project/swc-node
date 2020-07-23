import test from 'ava'

import { HygieneTest } from './class'
import { HygieneTestProperty } from './class-property'

test('hygiene constructor variable', (t) => {
  const DURATION = 1000
  const a = new HygieneTest()
  t.is(a.getDuration(), DURATION)
  t.is(new HygieneTestProperty().duration, DURATION)
})
