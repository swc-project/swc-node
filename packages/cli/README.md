# `@swc-node/cli`

<a href="https://npmcharts.com/compare/@swc-node/cli?minimal=true"><img src="https://img.shields.io/npm/dm/@swc-node/cli.svg?sanitize=true" alt="Downloads" /></a>

`@swc-node/cli` is a tiny Node-first CLI powered by `@swc-node/register`.

## Features

- TypeScript in both CommonJS and ESM projects.
- Hybrid module graphs (CJS importing ESM and ESM importing CJS).
- `compilerOptions.paths` / `baseUrl` path alias resolution from tsconfig.
- Node watch mode support (`--watch`, `--watch-path`, `--watch-preserve-output`).
- Node test runner support (`--test`).
- Decorator metadata support via tsconfig (`experimentalDecorators` + `emitDecoratorMetadata`).
- No extra swc dependencies required.

## Usage

### CLI

```bash
swc-node index.ts
swc-node --env-file=.env src/index.ts --port=3000
```

### Inline code (`-e` / `-p`)

```bash
swc-node -e "const n: number = 1; console.log(n + 1)"
swc-node -p "const n: number = 41; n + 1"
```

### Node test runner

```bash
swc-node --test ./math.test.ts
```

Without an explicit path, `swc-node --test` uses Node's default test discovery patterns, including TypeScript variants like:

```text
**/*.test.?[cm][jt]s
**/*-test.?[cm][jt]s
**/*_test.?[cm][jt]s
**/test-*.?[cm][jt]s
**/test.?[cm][jt]s
**/test/**/*.?[cm][jt]s
```

### Shebang scripts

For portable scripts, prefer putting options in `tsconfig.json` and keeping the shebang minimal:

```ts
#!/usr/bin/env swc-node

console.log('Hello, world!')
```

Then run the script directly:

```bash
./script.ts
```

### CLI helpers

```bash
swc-node --help
swc-node --version
```

## Read `tsconfig.json`

Set `SWC_NODE_PROJECT` via CLI flag:

```bash
swc-node --tsconfig ./tsconfig.dev.json src/index.ts
swc-node --tsconfig ./tsconfig.dev.json -e "console.log('hello')"
```

or via environment variable:

```bash
SWC_NODE_PROJECT=./tsconfig.dev.json swc-node src/index.ts
```

`swc-node` also supports `compilerOptions.paths`/`baseUrl` path aliases from the selected tsconfig.

```bash
swc-node --tsconfig ./tsconfig.dev.json src/index.ts
# imports like `@utils/foo` resolve from tsconfig paths
```

## Need lower-level APIs?

If you need a programmable API or direct preload hooks (`-r` / `--import`), use [`@swc-node/register`](https://www.npmjs.com/package/@swc-node/register).

## Notes

- Watch mode is delegated to Node (`--watch`) rather than custom orchestration.
- Running `swc-node` without an entrypoint is blocked (REPL mode is not supported).
- If you need a richer REPL/workflow tool, use [`tsx`](https://github.com/privatenumber/tsx).

## Thanks

Thanks to these projects for reference and preceding work:

- [`swrun`](https://www.npmjs.com/package/swrun)
- [`swcx`](https://www.npmjs.com/package/swcx)
- [`swc-node`](https://www.npmjs.com/package/swc-node)
- [`oxc-node`](https://www.npmjs.com/package/oxc-node)
- [`tsx`](https://www.npmjs.com/package/tsx)
- [`ts-node`](https://www.npmjs.com/package/ts-node)
