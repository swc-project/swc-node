// @ts-nocheck — unused interfaces are intentional
// These type-only constructs are stripped by SWC during transpilation.
// If source maps are broken, the reported line numbers in stack traces
// will be offset by the number of stripped lines.
interface Unused1 { a: string }
interface Unused2 { b: number }
interface Unused3 { c: boolean }
interface Unused4 { d: string }
interface Unused5 { e: number }
interface Unused6 { f: boolean }
interface Unused7 { g: string }
interface Unused8 { h: number }
interface Unused9 { i: boolean }

exports.throwError = function throwError() {
  throw new Error('sourcemap-test')
}
