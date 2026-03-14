import { parseArgs } from 'node:util'

type OptionToken = {
  kind: string
  name?: string
  value?: unknown
  rawName?: string
  inlineValue?: boolean
  index: number
}

export interface ParsedCliArgs {
  help: boolean
  version: boolean
  repl: boolean
  tsconfigPath?: string
  argv: string[]
}

export function parseCliArgs(rawArgs: string[]): ParsedCliArgs {
  const { values, tokens, positionals } = parseArgs({
    args: rawArgs,
    options: {
      // swc-node flags
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
      tsconfig: { type: 'string' },

      // node overrides
      eval: { type: 'string', short: 'e' },
      print: { type: 'string', short: 'p' },
    },
    allowPositionals: true,
    strict: false,
    tokens: true,
  })

  const tsconfigPath = typeof values.tsconfig === 'string' ? values.tsconfig : undefined
  const hasInlineCode = typeof values.eval === 'string' || typeof values.print === 'string'
  const transformedArgs = hasInlineCode ? transformInlineCodeArgs(rawArgs, tokens, tsconfigPath) : rawArgs
  const repl = shouldOpenRepl(positionals, values, rawArgs)

  return {
    help: Boolean(values.help),
    version: Boolean(values.version),
    repl,
    tsconfigPath,
    argv: stripCliArgs(transformedArgs, tokens),
  }
}

function shouldOpenRepl(positionals: string[], values: Record<string, unknown>, rawArgs: string[]): boolean {
  const hasEntrypoint = positionals.length > 0
  const hasInlineCode = typeof values.eval === 'string' || typeof values.print === 'string'

  // Keep Node modes that intentionally run without entrypoints.
  const hasNoEntrypointMode = rawArgs.some((arg) => arg === '--test' || arg === '--run' || arg.startsWith('--run='))

  return !hasEntrypoint && !hasInlineCode && !hasNoEntrypointMode
}

function transformInlineCodeArgs(args: string[], tokens: OptionToken[], tsconfigPath?: string): string[] {
  // Only import the register and readDefaultTsConfig when needed to avoid unnecessary dependencies for users who don't use --eval or --print.
  const { readDefaultTsConfig } =
    require('@swc-node/register/read-default-tsconfig') as typeof import('@swc-node/register/read-default-tsconfig')
  const { compile } = require('@swc-node/register/register') as typeof import('@swc-node/register/register')

  // readDefaultTsConfig caches by resolved tsconfig path internally, so calling
  // this here and later in register bootstrap remains cheap for repeated runs.
  const compilerOptions = readDefaultTsConfig(tsconfigPath)
  const transformedArgs = [...args]

  for (const token of [...tokens].reverse()) {
    if (token.kind !== 'option') {
      continue
    }

    if (token.name !== 'eval' && token.name !== 'print') {
      continue
    }

    if (typeof token.value !== 'string') {
      continue
    }

    const filename = token.name === 'eval' ? '[swc-node-eval].ts' : '[swc-node-print].ts'
    const compiled = compile(token.value, filename, { ...compilerOptions })

    if (token.inlineValue && token.rawName) {
      // Convert `--eval=<code>` / `--print=<expr>` to split form to preserve
      // Node evaluation semantics when transpiled code contains line breaks.
      transformedArgs.splice(token.index, 1, token.rawName, compiled)
    } else {
      transformedArgs[token.index + 1] = compiled
    }
  }

  return transformedArgs
}

function stripCliArgs(args: string[], tokens: OptionToken[]): string[] {
  const removeIndices = new Set<number>()

  for (const token of tokens) {
    if (token.kind !== 'option') {
      continue
    }
    if (token.name !== 'help' && token.name !== 'version' && token.name !== 'tsconfig') {
      continue
    }

    removeIndices.add(token.index)

    if (!token.inlineValue && token.name === 'tsconfig' && args[token.index + 1] != null) {
      removeIndices.add(token.index + 1)
    }
  }

  return args.filter((_, index) => !removeIndices.has(index))
}
