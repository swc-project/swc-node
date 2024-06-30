import { AVAILABLE_TS_EXTENSION_PATTERN } from '@swc-node/register/register.ts'
import test from 'ava'
import * as ts from 'typescript'

const tsExtensions = [ts.Extension.Ts, ts.Extension.Tsx, ts.Extension.Mts, ts.Extension.Cts]
const nonTsExtensions = [ts.Extension.Js, ts.Extension.Jsx, ts.Extension.Mjs, ts.Extension.Cjs, '.es6', '.es']
const ignoreExtensions = ['.txt', '.json', '.xml']

test(`AVAILABLE_TS_EXTENSION_PATTERN matches TypeScript extensions`, (t) => {
  tsExtensions.forEach((ext) => {
    t.true(AVAILABLE_TS_EXTENSION_PATTERN.test(`file${ext}`))
  })
})

test(`AVAILABLE_TS_EXTENSION_PATTERN does not match d.ts`, (t) => {
  tsExtensions.forEach((ext) => {
    t.false(AVAILABLE_TS_EXTENSION_PATTERN.test(`file.d${ext}`))
  })
})

test(`AVAILABLE_TS_EXTENSION_PATTERN does not match non-ts extensions`, (t) => {
  ;[...nonTsExtensions, ...ignoreExtensions].forEach((ext) => {
    t.false(AVAILABLE_TS_EXTENSION_PATTERN.test(`file${ext}`))
  })
})
