import test from 'ava'

test('optional chain function call', (t) => {
  const obj = {
    a: {
      b: {
        c: function () {
          return this.foo
        },
        foo: 2,
      },
      foo: 1,
    },
  }

  t.is(obj?.a?.b?.c(), 2)
})
