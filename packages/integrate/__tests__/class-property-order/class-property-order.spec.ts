import test from 'ava'
import Sinon from 'sinon'

import { Base } from './class-property-order'

test('hygiene constructor variable', (t) => {
  const spy = Sinon.spy()
  const base = new Base({ logger: { child: (data) => () => spy(data) } })
  base.log()
  t.is(spy.callCount, 2)
  const [[arg]] = spy.args
  t.is(arg.component, 'Base')
})
