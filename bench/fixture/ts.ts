import * as ts from 'typescript'

if (!ts.ScriptTarget.ESNext) {
  throw new Error('typescript ScriptTarget export was not loaded')
}
