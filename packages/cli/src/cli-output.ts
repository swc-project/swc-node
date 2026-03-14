export function printVersion(version: string) {
  process.stdout.write(`${version}\n`)
}

export function printReplNotSupported() {
  process.stderr.write('swc-node: REPL mode is not supported. Pass a file, --eval/--print, or use --test/--run.\n\n')
}

export function printHelp(version: string) {
  const helpMsg = `

@swc-node/cli ${version} is a tiny Node-first CLI powered by @swc-node/register

Usage:
  swc-node [swc-node flags] [node flags] <entry> [script args]
  swc-node --watch <entry>

Swc-node Flags:
  -h, --help             Show this help message
  -v, --version          Show swc-node version
  --tsconfig <path>      Use a specific tsconfig (or set SWC_NODE_PROJECT environment variable)

Node Flags With TS Support:
  -e, --eval <code>      Evaluate TypeScript code
  -p, --print <expr>     Evaluate and print TypeScript expression

Examples:
  swc-node index.ts
  swc-node -e "const n: number = 1; console.log(n)"
  swc-node -p "const n: number = 41; n + 1"
  swc-node --tsconfig ./tsconfig.dev.json src/index.ts

`.trim()

  process.stdout.write(`${helpMsg}\n`)
}
