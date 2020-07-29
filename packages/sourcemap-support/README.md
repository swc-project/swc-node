# `@swc-node/sourcemap-support`

```ts
import { SourcemapMap, installSourceMapSupport } from '@swc-node/sourcemap-support'

function transform(sourcecode, filename, options) {
  const { code, map } = transformSync(sourcecode, filename, options)
  SourcemapMap.set(filename, map)
  return code
}
```
