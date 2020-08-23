# `swc-node`

**_Fast `TypeScript/JavaScript` transformer without `node-gyp` and postinstall script_**.

<p>
  <a href="https://github.com/Brooooooklyn/swc-node/actions"><img src="https://github.com/Brooooooklyn/swc-node/workflows/CI/badge.svg" alt="Build Status" /></a>
  <a href="https://npmcharts.com/compare/@swc-node/core?minimal=true"><img src="https://img.shields.io/npm/dm/@swc-node/core.svg?sanitize=true" alt="Downloads" /></a>
  <a href="https://github.com/Brooooooklyn/swc-node/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@swc-node/core.svg?sanitize=true" alt="License" /></a>
</p>

## Support matrix

|             | node 10 | node12 | node14 |
| ----------- | ------- | ------ | ------ |
| Windows x64 | ✅      | ✅     | ✅     |
| macOS       | ✅      | ✅     | ✅     |
| Linux x64   | ✅      | ✅     | ✅     |

## @swc-node/core

Fastest `TypeScript` transformer.

Detail: [@swc-node/core](./packages/core)

### Benchmark

> ⚠️ Notes: `transformSync` API in esbuild has huge overhead. So `swc` is only faster than esbuild in `transformSync` API. In the `transform` API, `esbuild` is about **5x faster** than `swc`.

> transform RxJS `AjaxObservable.ts` to ES2015 & CommonJS `JavaScript`. Benchmark code: [bench](./bench/index.js)

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
@swc-node/core x 172 ops/sec ±2.66% (79 runs sampled)
@swc/core x 78.72 ops/sec ±2.82% (68 runs sampled)
esbuild x 51.85 ops/sec ±2.91% (54 runs sampled)
typescript x 24.39 ops/sec ±17.26% (48 runs sampled)
Transform rxjs/AjaxObservable.ts benchmark bench suite: Fastest is @swc-node/core
```

#### `transform` single thread

```bash
@swc-node/core x 135 ops/sec ±1.99% (70 runs sampled)
@swc/core x 64.12 ops/sec ±1.23% (74 runs sampled)
esbuild x 463 ops/sec ±2.08% (76 runs sampled)
Transform rxjs/AjaxObservable.ts benchmark bench suite: Fastest is esbuild
```

#### `transform` parallel

```bash
@swc-node/core x 406 ops/sec ±4.16% (56 runs sampled)
@swc/core x 181 ops/sec ±7.14% (41 runs sampled)
esbuild x 928 ops/sec ±3.72% (70 runs sampled)
Transform rxjs/AjaxObservable.ts benchmark bench suite: Fastest is esbuild
```

## @swc-node/jest

Fastest jest `TypeScript` transformer.

Detail: [@swc-node/jest](./packages/jest)

### Performance glance

> Testing in pure `TypeScript` project, compile target is `ES2018`.

#### ts-jest

```
Test Suites: 48 passed, 48 total
Tests:       239 passed, 239 total
Snapshots:   49 passed, 49 total
Time:        49.808 s
Ran all test suites.
✨  Done in 54.35s.
```

#### @swc-node/jest

```
Test Suites: 49 passed, 49 total
Tests:       250 passed, 250 total
Snapshots:   53 passed, 53 total
Time:        9.921 s
Ran all test suites.
✨  Done in 15.79s.
```

## @swc-node/register

Faster `ts-node/register/transpile-only` alternative.

Detail: [@swc-node/register](./packages/register)

## Development

### Install dependencies

- `yarn@1.x` latest
- `rust@nightly` latest

### Build and test

- `yarn`
- `cargo build --release && yarn build`
- `yarn test`
