# `@swc-node/jest`

<a href="https://npmcharts.com/compare/@swc-node/jest?minimal=true"><img src="https://img.shields.io/npm/dm/@swc-node/jest.svg?sanitize=true" alt="Downloads" /></a>

> 🚀 Help me to become a full-time open-source developer by [sponsoring me on Github](https://github.com/sponsors/Brooooooklyn)

## Usage

```ts
// jest.config.js

module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc-node/jest'],
  },
}
```

## Configuration

Configuration can be passed as a second argument to `transform`:

```ts
// jest.config.js

module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc-node/jest',

      // configuration
      {
        dynamicImport: true,
        react: {
          pragma: 'h',
        },
      },
    ],
  },
}
```

[List of all of the available configuration options](https://github.com/swc-project/swc-node/blob/master/packages/core/index.ts#L6).
