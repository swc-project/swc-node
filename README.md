# `swc-node`

**_Fast `TypeScript/JavaScript` transformer without `node-gyp` and postinstall script_**.

<p>
  <a href="https://github.com/Brooooooklyn/swc-node/actions"><img src="https://github.com/Brooooooklyn/swc-node/workflows/CI/badge.svg" alt="Build Status" /></a>
  <a href="https://npmcharts.com/compare/@swc-node/core?minimal=true"><img src="https://img.shields.io/npm/dm/@swc-node/core.svg?sanitize=true" alt="Downloads" /></a>
  <a href="https://github.com/Brooooooklyn/swc-node/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@swc-node/core.svg?sanitize=true" alt="License" /></a>
</p>

## Support matrix

|                     | node10 | node12 | node14 | node15 |
| ------------------- | ------ | ------ | ------ | ------ |
| Windows x64         | ✓      | ✓      | ✓      | ✓      |
| Windows x32         | ✓      | ✓      | ✓      | ✓      |
| macOS x64           | ✓      | ✓      | ✓      | ✓      |
| macOS arm64         | ✓      | ✓      | ✓      | ✓      |
| Linux x64 gnu       | ✓      | ✓      | ✓      | ✓      |
| Linux x64 musl      | ✓      | ✓      | ✓      | ✓      |
| Linux arm gnueabihf | ✓      | ✓      | ✓      | ✓      |
| Linux arm64 gnu     | ✓      | ✓      | ✓      | ✓      |
| Android arm64       | ✓      | ✓      | ✓      | ✓      |

## @swc-node/core

Fastest `TypeScript` transformer.

Detail: [@swc-node/core](./packages/core)

### Benchmark

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
@swc-node/core x 434 ops/sec ±0.48% (90 runs sampled)
esbuild x 51.82 ops/sec ±3.89% (66 runs sampled)
typescript x 23.91 ops/sec ±12.38% (49 runs sampled)
babel x 22.93 ops/sec ±9.21% (45 runs sampled)
Transform rxjs/AjaxObservable.ts benchmark bench suite: Fastest is @swc-node/core
```

#### `transform` parallel

```bash
@swc-node/core x 1,032 ops/sec ±2.68% (72 runs sampled)
esbuild x 928 ops/sec ±1.48% (78 runs sampled)
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

- `yarn@1.x` latest
- `rust@nightly` latest

### Build and test

- `yarn`
- `cargo build --release && yarn build`
- `yarn test`
