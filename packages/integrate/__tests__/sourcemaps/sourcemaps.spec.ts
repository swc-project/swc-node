import { readFileSync } from 'fs'
import { join } from 'path'

import test from 'ava'

test('should report correct line numbers in stack traces when sourceMap is true', (t) => {
  if (process.platform === 'win32') {
    return t.pass('Skip on Windows')
  }

  // Read the helper file to find the actual line number of the throw statement.
  // This makes the test resilient to reformatting: if the file layout changes,
  // the expected line number updates automatically.
  const helperPath = join(__dirname, 'throw-with-interfaces.ts')
  const source = readFileSync(helperPath, 'utf-8')
  const expectedLine = source.split('\n').findIndex((line) => line.includes("throw new Error('sourcemap-test')")) + 1
  t.true(expectedLine > 0, 'Could not find throw statement in throw-with-interfaces.ts')

  // The helper file has 9 TypeScript interfaces before the throw.
  // SWC strips them during transpilation, so if source maps are broken
  // the reported line number will be lower than the actual source line.
  try {
    require('./throw-with-interfaces').throwError()
    t.fail('Expected throwError() to throw')
  } catch (err) {
    const stack = (err as Error).stack ?? ''
    const match = stack.match(/throw-with-interfaces\.ts:(\d+)/)
    t.truthy(match, `Stack trace should reference throw-with-interfaces.ts, got:\n${stack}`)
    const actualLine = parseInt(match![1], 10)
    t.is(actualLine, expectedLine, `Expected error on line ${expectedLine} but stack trace reported line ${actualLine}`)
  }
})
