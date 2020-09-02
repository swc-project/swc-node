import test from 'ava'

test('dynamic import', async (t) => {
  const { FOO } = await import('./foo')
  t.true(FOO)
})
