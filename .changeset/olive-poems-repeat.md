---
'@swc-node/register': minor
---

Add `@swc-node/register/esm-register-next` and `@swc-node/register/esm-next`, which register the loader hooks with
`module.registerHooks()` instead of the runtime deprecated `module.register()` (DEP0205).

The hooks run synchronously in the same thread as the modules they transform, so they also apply to `require()`, they
are easier to debug, and they are not subject to the deadlocks of the off-thread hooks. `esm-register` keeps working
unchanged for Node.js versions without `module.registerHooks()` (added in 22.15).

```bash
node --import @swc-node/register/esm-register-next script.ts
```
