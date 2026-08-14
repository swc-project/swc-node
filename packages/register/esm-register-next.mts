import { registerHooks } from 'node:module'

import { load, resolve } from './esm-next.mjs'

registerHooks({ resolve, load })
