# `swc-node`

> 🚀 Help me to become a full-time open-source developer by [sponsoring me on Github](https://github.com/sponsors/Brooooooklyn)

**_Fast `TypeScript/JavaScript` transformer without `node-gyp` and postinstall script_**.

<p>
  <a href="https://github.com/swc-project/swc-node/actions"><img src="https://github.com/swc-project/swc-node/workflows/CI/badge.svg" alt="Build Status" /></a>
  <a href="https://npmcharts.com/compare/@swc-node/core?minimal=true"><img src="https://img.shields.io/npm/dm/@swc-node/core.svg?sanitize=true" alt="Downloads" /></a>
  <a href="https://github.com/swc-project/swc-node/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@swc-node/core.svg?sanitize=true" alt="License" /></a>
</p>

## Usage

Run TypeScript with node, without compilation or typechecking:

```bash
npm i -D @swc-node/register
node -r @swc-node/register script.ts
node --import @swc-node/register/esm-register script.ts # for esm project with node>=20.6
node --loader @swc-node/register/esm script.ts # for esm project with node<=20.5, deprecated
```

Pass `--enable-source-maps` to node for esm projects

Set environment variable SWCRC=true when you would like to load .swcrc file

```bash
SWCRC=true node -r @swc-node/register script.ts
```

```typescript
#!/usr/bin/env -S node --import @swc-node/register/esm-register

// your code
```

run with shebang, add `TS_NODE_PROJECT=null`(`#!/usr/bin/env TS_NODE_PROJECT=null node --import @swc-node/register/esm-register`) to use ignore tsconfig.json

## @swc-node/core

Fastest `TypeScript` transformer.

Detail: [@swc-node/core](./packages/core)

### Benchmark

> transform RxJS `AjaxObservable.ts` to ES2015 & CommonJS `JavaScript`. Benchmark code: [bench](./bench/index.ts)

**Hardware info**:

```
Model Name: MacBook Pro
Model Identifier: MacBookPro15,1
Processor Name: 6-Core Intel Core i7
Processor Speed: 2.6 GHz
Number of Processors: 1
Total Number of Cores: 6
L2 Cache (per Core): 256 KB
L3 Cache: 12 MB
Hyper-Threading Technology: Enabled
Memory: 16 GB
```

#### `transformSync`

```bash
esbuild x 510 ops/sec ±1.28% (88 runs sampled)
@swc-node/core x 438 ops/sec ±1.00% (88 runs sampled)
typescript x 28.83 ops/sec ±10.20% (52 runs sampled)
babel x 24.21 ops/sec ±10.66% (46 runs sampled)
Transform rxjs/AjaxObservable.ts benchmark bench suite: Fastest is esbuild
```

#### `transform` parallel

`UV_THREADPOOL_SIZE=11 yarn bench`

```bash
@swc-node/core x 1,253 ops/sec ±0.90% (75 runs sampled)
esbuild x 914 ops/sec ±1.31% (77 runs sampled)
Transform rxjs/AjaxObservable.ts parallel benchmark bench suite: Fastest is @swc-node/core
```

`yarn bench`

```bash
@swc-node/core x 1,123 ops/sec ±0.95% (77 runs sampled)
esbuild x 847 ops/sec ±3.74% (71 runs sampled)
Transform rxjs/AjaxObservable.ts parallel benchmark bench suite: Fastest is @swc-node/core
```

## @swc-node/jest

Fastest jest `TypeScript` transformer.

Detail: [@swc-node/jest](./packages/jest)

### Performance glance

> Testing in pure `TypeScript` project, compile target is `ES2018`.
> Running with `npx jest --no-cache`, `ts-jest` was configured with `isolatedModules: true`

#### ts-jest

```
Test Suites: 49 passed, 49 total
Tests:       254 passed, 254 total
Snapshots:   53 passed, 53 total
Time:        54.631 s
Ran all test suites.
✨  Done in 62.71s.
```

#### @swc-node/jest

```
Test Suites: 49 passed, 49 total
Tests:       254 passed, 254 total
Snapshots:   53 passed, 53 total
Time:        10.511 s
Ran all test suites.
✨  Done in 14.34s.
```

## @swc-node/register

Faster `ts-node/register/transpile-only` alternative.

Detail: [@swc-node/register](./packages/register)

## Development

### Install dependencies

- `pnpm i`

### Build and Test

- `pnpm build`

- `pnpm test`

## Sponsors

<p align="center">
  <img src="https://sponsors.lyn.one/sponsors.svg" alt="sponsors" />
</p>
