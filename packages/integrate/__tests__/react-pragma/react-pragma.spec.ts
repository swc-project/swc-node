import { transform } from '@swc-node/core'
import test from 'ava'

const fixture = `
  const Button = ({ text }) => (
    <div>
      {text}
    </div>
  )
`

test('should transform jsx factory use React.pragma', async (t) => {
  t.snapshot(
    (
      await transform(fixture, 'test.tsx', {
        react: {
          pragma: 'h',
        },
      })
    ).code,
  )
})

test('should transform jsx into new jsx runtime', async (t) => {
  t.snapshot(
    (
      await transform(fixture, 'test.tsx', {
        react: {
          runtime: 'automatic',
        },
      })
    ).code,
  )
})
