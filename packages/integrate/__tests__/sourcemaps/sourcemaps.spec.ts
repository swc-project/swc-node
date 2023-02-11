import test from 'ava'

// @ts-expect-error
interface _Unused1 {}
// @ts-expect-error
interface _Unused2 {}
// @ts-expect-error
interface _Unused3 {}
// @ts-expect-error
interface _Unused4 {}
// @ts-expect-error
interface _Unused5 {}
// @ts-expect-error
interface _Unused6 {}
// @ts-expect-error
interface _Unused7 {}
// @ts-expect-error
interface _Unused8 {}
// @ts-expect-error
interface _Unused9 {}

test('should work with sourcemaps', (t) => {
  t.snapshot(new Error().stack)
})
