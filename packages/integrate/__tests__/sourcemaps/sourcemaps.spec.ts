import { join } from 'path'

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
  if (process.platform === 'win32') {
    return t.pass('Skip on Windows')
  }
  const projectRoot = join(__dirname, '..', '..', '..', '..')
  t.snapshot(
    new Error().stack
      ?.split('\n')
      .map((l) => l.replace(projectRoot, ''))
      .filter((n) => !n.includes('node:internal'))
      .join('\n'),
  )
})
