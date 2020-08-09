# `@swc-node/core`

## Benchmark

> transform AjaxObservable.ts to ES2015 & CommonJS `JavaScript`.

```
@swc-node/core x 151 ops/sec ±3.74% (77 runs sampled)
@swc/core x 107 ops/sec ±0.51% (78 runs sampled)
esbuild x 52.89 ops/sec ±1.58% (67 runs sampled)
typescript x 21.08 ops/sec ±9.68% (40 runs sampled)
Transform rxjs/AjaxObservable.ts benchmark bench suite: Fastest is @swc-node/core
```

## Usage

```ts
export interface Options {
  target?: 'es3' | 'es5' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020'
  module?: 'commonjs' | 'umd' | 'amd' | 'es6'
  sourcemap?: boolean | 'inline'
  experimentalDecorators?: boolean
  emitDecoratorMetadata?: boolean
  dynamicImport?: boolean
}

export function transformSync(
  source: string | Buffer,
  path: string,
  options?: Options,
): {
  code: string
  map: string
}

export function transform(
  source: string | Buffer,
  path: string,
  options?: Options,
): Promise<{
  code: string
  map: string
}>
```
