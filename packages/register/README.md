# `@swc-node/register`

## Usage

```ts
const register = require('@swc-node/register')

register({
  ...
})
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
