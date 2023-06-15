import test from 'ava'

const { process } = require('../index')

const BrorrwFromTsJest = `
const foo = 'foo'
console.log(foo)
jest.enableAutomock()
jest.disableAutomock()
jest.mock('./foo')
jest.mock('./foo/bar', () => 'bar')
jest.unmock('./bar/foo').dontMock('./bar/bar')
jest.deepUnmock('./foo')
jest.mock('./foo').mock('./bar')
const func = () => {
  const bar = 'bar'
  console.log(bar)
  jest.unmock('./foo')
  jest.mock('./bar')
  jest.mock('./bar/foo', () => 'foo')
  jest.unmock('./foo/bar')
  jest.unmock('./bar/foo').dontMock('./bar/bar')
  jest.deepUnmock('./bar')
  jest.mock('./foo').mock('./bar')
}
const func2 = () => {
  const bar = 'bar'
  console.log(bar)
  jest.mock('./bar')
  jest.unmock('./foo/bar')
  jest.mock('./bar/foo', () => 'foo')
  jest.unmock('./foo')
  jest.unmock('./bar/foo').dontMock('./bar/bar')
  jest.deepUnmock('./bar')
  jest.mock('./foo').mock('./bar')
}
`

test('should hoist top level jest mock call', (t) => {
  const { code } = process(BrorrwFromTsJest, 'jest.spec.ts', {
    transformerConfig: { target: 'es2018', sourcemap: false },
  })
  t.snapshot(code)
})
