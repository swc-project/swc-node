# `swc-node`

![](https://github.com/Brooooooklyn/swc-node/workflows/CI/badge.svg)

## Support matrix

|             | node 10 | node12 | node14 |
| ----------- | ------- | ------ | ------ |
| Windows x64 | ✅      | ✅     | ✅     |
| macOS       | ✅      | ✅     | ✅     |
| Linux x64   | ✅      | ✅     | ✅     |

## @swc-node/core

Fastest `TypeScript` transformer.

Usage: [@swc-node/core](./packages/core)

### Benchmark

> transform AjaxObservable.ts to ES2015 & CommonJS `JavaScript`. Benchmark code: [bench](./bench/index.js)

```
@swc-node/core x 151 ops/sec ±3.74% (77 runs sampled)
@swc/core x 107 ops/sec ±0.51% (78 runs sampled)
esbuild x 52.89 ops/sec ±1.58% (67 runs sampled)
typescript x 21.08 ops/sec ±9.68% (40 runs sampled)
Transform rxjs/AjaxObservable.ts benchmark bench suite: Fastest is @swc-node/core
```

## @swc-node/jest

Fastest jest `TypeScript` transformer.

Detail: [@swc-node/jest](./packages/jest)

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
