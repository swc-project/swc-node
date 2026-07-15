import assert from 'node:assert'

import data from './data.txt' with { type: 'text' }

assert.equal(data, 'text import works\n')
