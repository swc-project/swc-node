# `@swc-node/loader`

> 🚀 Help me to become a full-time open-source developer by [sponsoring me on Github](https://github.com/sponsors/Brooooooklyn)

<a href="https://npmcharts.com/compare/@swc-node/loader?minimal=true"><img src="https://img.shields.io/npm/dm/@swc-node/loader.svg?sanitize=true" alt="Downloads" /></a>

## Usage

```js
{
  test: /\.tsx?$/,
  use: [
    {
      loader: '@swc-node/loader',
      // If options not passed
      // `@swc-node/loader` will read the project `tsconfig.json` as compile options
      // If the default `tsconfig.json` parse failed or not existed
      // The default options will be used
      // `compilerOptions` is the same with `compilerOptions in tsconfig`
      options: {
        // if `compilerOptions` provided, `configFile` will be ignored
        compilerOptions: {
          target: 'ES5',
          module: 'esnext',
          sourceMap: true,
          jsx: true,
        },
        // absolute path for tsconfig.json
        configFile: path.join(process.cwd(), 'tsconfig.build.json'),
        // enable react fast refresh
        fastRefresh: true
      }
    }
  ],
  exclude: /node_modules/,
}
```

## Differences between [swc-loader](https://github.com/swc-project/swc-loader)

This `loader` is compatible with `tsconfig.json` and `compilerOptions` in `tsconfig.json`.
