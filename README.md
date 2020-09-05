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

> ⚠️ Notes: `transformSync` API in esbuild has huge overhead. So `swc` is only faster than esbuild in `transformSync` API. In the `transform` API, `esbuild` is about **1.2x ~ 2x faster** than `swc`.

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
@swc-node/core x 300 ops/sec ±2.93% (80 runs sampled)
@swc/core x 326 ops/sec ±1.58% (86 runs sampled)
esbuild x 44.93 ops/sec ±1.10% (58 runs sampled)
typescript x 27.77 ops/sec ±9.67% (53 runs sampled)
babel x 23.08 ops/sec ±10.45% (45 runs sampled)
Transform rxjs/AjaxObservable.ts benchmark bench suite: Fastest is @swc/core
```

#### `transform` single thread

```bash
@swc-node/core x 247 ops/sec ±3.94% (74 runs sampled)
@swc/core x 244 ops/sec ±1.90% (76 runs sampled)
esbuild x 448 ops/sec ±2.75% (75 runs sampled)
Transform rxjs/AjaxObservable.ts async benchmark bench suite: Fastest is esbuild
```

#### `transform` parallel

```bash
@swc-node/core x 727 ops/sec ±1.20% (71 runs sampled)
@swc/core x 794 ops/sec ±2.65% (69 runs sampled)
esbuild x 1,009 ops/sec ±2.37% (69 runs sampled)
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
