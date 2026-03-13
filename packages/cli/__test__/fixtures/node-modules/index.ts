import { value as depTsValue } from 'dep-ts'
import depCjs from 'dep-cjs'
import depCts from 'dep-cts'

console.log([depTsValue, depCts.value, depCjs.value].join(','))
