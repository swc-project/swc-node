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
@swc-node/core x 208 ops/sec ±1.01% (82 runs sampled)
@swc/core x 122 ops/sec ±2.86% (78 runs sampled)
esbuild x 50.71 ops/sec ±2.17% (65 runs sampled)
typescript x 28.16 ops/sec ±10.53% (51 runs sampled)
babel x 27.70 ops/sec ±9.81% (53 runs sampled)
Transform rxjs/AjaxObservable.ts benchmark bench suite: Fastest is @swc-node/core
```

#### `transform` single thread

```bash
@swc-node/core x 161 ops/sec ±2.04% (73 runs sampled)
@swc/core x 104 ops/sec ±2.44% (69 runs sampled)
esbuild x 463 ops/sec ±1.99% (77 runs sampled)
Transform rxjs/AjaxObservable.ts async benchmark bench suite: Fastest is esbuild
```

#### `transform` parallel

```bash
@swc-node/core x 514 ops/sec ±2.31% (67 runs sampled)
@swc/core x 361 ops/sec ±1.26% (70 runs sampled)
esbuild x 986 ops/sec ±2.04% (75 runs sampled)
Transform rxjs/AjaxObservable.ts parallel benchmark bench suite: Fastest is esbuild
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

- `yarn@1.x` latest
- `rust@nightly` latest

### Build and test

- `yarn`
- `cargo build --release && yarn build`
- `yarn test`
