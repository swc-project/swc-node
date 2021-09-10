# `@swc-node/core`

<a href="https://npmcharts.com/compare/@swc-node/core?minimal=true"><img src="https://img.shields.io/npm/dm/@swc-node/core.svg?sanitize=true" alt="Downloads" /></a>

> 🚀 Help me to become a full-time open-source developer by [sponsoring me on Github](https://github.com/sponsors/Brooooooklyn)

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
  esModuleInterop?: boolean
  keepClassNames?: boolean
  react?: Partial<ReactConfig>
  paths?: {
    [from: string]: [string]
  }
}

export interface ReactConfig {
  /**
   * Replace the function used when compiling JSX expressions.
   *
   * Defaults to `React.createElement`.
   */
  pragma: string
  /**
   * Replace the component used when compiling JSX fragments.
   *
   * Defaults to `React.Fragment`
   */
  pragmaFrag: string
  /**
   * Toggles whether or not to throw an error if a XML namespaced tag name is used. For example:
   * `<f:image />`
   *
   * Though the JSX spec allows this, it is disabled by default since React's
   * JSX does not currently have support for it.
   *
   */
  throwIfNamespace: boolean
  /**
   * Toggles plugins that aid in development, such as @swc/plugin-transform-react-jsx-self
   * and @swc/plugin-transform-react-jsx-source.
   *
   * Defaults to `false`,
   *
   */
  development: boolean
  /**
   * Use `Object.assign()` instead of `_extends`. Defaults to false.
   */
  useBuiltins: boolean
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
