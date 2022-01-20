import { Config } from '@swc/core'
import test from 'ava'
import { CompilerOptions } from 'typescript'

import { createSourcemapOption } from '../read-default-tsconfig'

const FIXTURES: [CompilerOptions, Config['sourceMaps']][] = [
  [{ sourceMap: true, inlineSourceMap: true }, 'inline'],
  [{ sourceMap: false, inlineSourceMap: true }, 'inline'],
  [{ sourceMap: true, inlineSourceMap: false }, true],
  [{ sourceMap: false, inlineSourceMap: false }, false],
  [{ inlineSourceMap: true }, 'inline'],
  [{ inlineSourceMap: false }, true],
]

for (const [config, expect] of FIXTURES) {
  test(`should create ${expect} from ${JSON.stringify(config)}`, (t) => {
    t.is(createSourcemapOption(config), expect!)
  })
}
