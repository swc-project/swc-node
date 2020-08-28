const { transformJest } = require('@swc-node/core')

const fixture = `
import { timer } from 'utils'

jest.mock('./utils')

describe('timer', () => {
  it('timer should work', () => {
    expect(timer()).toBe(1)
  })
})

jest.unmock()
`

const { code } = transformJest(fixture, 'timer.spec.ts')

console.log(code)
