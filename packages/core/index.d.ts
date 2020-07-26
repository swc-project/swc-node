export interface Options {
  target: 'es3' | 'es5' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020'
  module: 'commonjs' | 'umd' | 'amd' | 'es6'
  sourcemap: boolean | 'inline'
  hygiene: boolean
  tsx: boolean
  decorators: boolean
  dynamic_import: boolean
  no_early_errors: boolean
}

export function transformSync(
  source: string | Buffer,
  path: string,
  options?: Options,
): {
  code: string
  map: string
}

export function transform(
  source: string | Buffer,
  path: string,
  options?: Options,
): Promise<{
  code: string
  map: string
}>
