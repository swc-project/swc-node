# `@swc-node/register`

<a href="https://npmcharts.com/compare/@swc-node/register?minimal=true"><img src="https://img.shields.io/npm/dm/@swc-node/register.svg?sanitize=true" alt="Downloads" /></a>

> 🚀 Help me to become a full-time open-source developer by [sponsoring me on Github](https://github.com/sponsors/Brooooooklyn)

## Usage

```ts
const { register } = require('@swc-node/register/register')

register({
  ...
})
```

### CLI

```
node -r @swc-node/register index.ts
```

### Mocha

```
mocha --require @swc-node/register --watch-extensions ts,tsx "test/**/*.{ts,tsx}" [...args]
```

### ava

```json
// package.json

{
  "ava": {
    "extensions": ["ts", "tsx"],
    "require": ["@swc-node/register"],
    "files": ["packages/**/*.spec.{ts,tsx}"]
  }
}
```

## Read `tsconfig.json`

set `SWC_NODE_PROJECT` or `TS_NODE_PROJECT` env:

```bash
SWC_NODE_PROJECT=./tsconfig.test.json mocha --require @swc-node/register --watch-extensions ts,tsx "test/**/*.{ts,tsx}" [...args]
```

`@swc-node/register` respect the following option in `tsconfig`:

### `extends`

`@swc-node/register` respect the extends key in `tsconfig.json`, and use the **merged** values.

### `compilerOptions.target`

```ts
switch (target) {
  case ts.ScriptTarget.ES3:
    return 'es3'
  case ts.ScriptTarget.ES5:
    return 'es5'
  case ts.ScriptTarget.ES2015:
    return 'es2015'
  case ts.ScriptTarget.ES2016:
    return 'es2016'
  case ts.ScriptTarget.ES2017:
    return 'es2017'
  case ts.ScriptTarget.ES2018:
    return 'es2018'
  case ts.ScriptTarget.ES2019:
    return 'es2019'
  case ts.ScriptTarget.ES2020:
  case ts.ScriptTarget.ES2021:
  case ts.ScriptTarget.ES2022:
  case ts.ScriptTarget.ESNext:
  case ts.ScriptTarget.Latest:
    return 'es2020'
  case ts.ScriptTarget.JSON:
    return 'es5'
}
```

### `compilerOptions.jsx`

If `filename` endsWith `.jsx` or `.tsx`, always set the `jsx: true` in `swc config` regards the `jsx` option in `tsconfig`.
If `filename` not endsWith `.jsx` or `.tsx`, set the `jsx: Boolean(tsconfig.compilerOptions.jsx)` in `swc config`.

### compilerOptions.module

> notes, if `compilerOptions.module` higher than `es2020`, the `dynamicImport` in `swc config` will be set to `true`.

```ts
switch (moduleKind) {
  case ts.ModuleKind.CommonJS:
    return 'commonjs'
  case ts.ModuleKind.UMD:
    return 'umd'
  case ts.ModuleKind.AMD:
    return 'amd'
  case ts.ModuleKind.ES2015:
  case ts.ModuleKind.ES2020:
  case ts.ModuleKind.ESNext:
  case ts.ModuleKind.None:
    return 'es6'
  case ts.ModuleKind.System:
    throw new TypeError('Do not support system kind module')
}
```

### compilerOptions.experimentalDecorators

Respect the boolean value in `tsconfig`.

### compilerOptions.emitDecoratorMetadata

Respect the boolean value in `tsconfig`.

### compilerOptions.esModuleInterop

Respect the boolean value in `tsconfig`.

### include/exclude

`TypeScript` gives files list to `@swc-node/register`, if parse `tsconfig.json` failed or files list empty, `@swc-node/register` will transform all files which were required.

And if failed to parse `tsconfig.json`, `@swc-node/register` will print warning which contains failed reason.

## Performance tuning

### Transform cache

`@swc-node/register` now keeps a transform cache (memory + disk) keyed by source, filename, compiler options, and runtime versions.

Environment variables:

- `SWC_NODE_CACHE=0` disable cache.
- `SWC_NODE_CACHE_DIR=/path/to/cache` choose disk cache directory.
  - default: `${os.tmpdir()}/swc-node-${process.getuid() ?? process.pid}`
- `SWC_NODE_CACHE_TTL_DAYS=7` disk cache retention in days.
- `SWC_NODE_CACHE_MEMORY_LIMIT=2000` max in-process transform entries.
- `SWC_NODE_CACHE_DEBUG=1` print cache hit/miss/store/skip lines to stderr.

Programmatic cache control:

```js
const { clearTransformCache, getTransformCacheDirectory } = require('@swc-node/register/register')

// clear memory + disk (default)
clearTransformCache()

// clear only memory cache
clearTransformCache({ memory: true, disk: false })

// inspect resolved disk cache path
console.log(getTransformCacheDirectory())
```

### Source map memory mode

Use `SWC_NODE_SOURCE_MAP_MODE` to tune source map memory behavior:

- `auto` (default): inline maps when Node native source maps are enabled, otherwise map-store mode.
- `inline`: inline data URL source maps only.
- `store`: in-memory map store only (`source-map-support` path).
- `both`: inline + store (highest memory use, mainly for compatibility/debug edge cases).
- `none`: disable both inline/store map injection.
