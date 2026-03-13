import * as dep from './cjs-dep.cts'

const cjsDep = (dep as { default?: { value?: string }; value?: string }).default ?? dep
console.log((cjsDep as { value?: string }).value)
