import { createRequire } from 'node:module'

import test from 'ava'

// tsconfig maps `@swc-node/core` to its TypeScript source; a bare ESM named
// import would resolve there and lose the export through swc's CJS interop.
// require() resolves the package's built CommonJS entry, where `transform` is a
// plain named export.
const require = createRequire(import.meta.url)
const { transform } = require('@swc-node/core')

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
