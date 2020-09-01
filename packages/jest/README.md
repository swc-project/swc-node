# `@swc-node/jest`

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
      }
    ],
  },
}
```

[List of all of the available configuration options](https://github.com/Brooooooklyn/swc-node/blob/master/packages/core/index.ts#L6).
