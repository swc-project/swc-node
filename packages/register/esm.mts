import { readFile } from 'fs/promises'
import { createRequire, type LoadFnOutput, type LoadHook, type ResolveFnOutput, type ResolveHook } from 'node:module'
import { extname } from 'path'
import { fileURLToPath, parse as parseUrl, pathToFileURL } from 'url'

import debugFactory from 'debug'
import ts from 'typescript'

// @ts-expect-error
import { readDefaultTsConfig } from '../lib/read-default-tsconfig.js'
// @ts-expect-error
import { AVAILABLE_TS_EXTENSION_PATTERN, compile } from '../lib/register.js'

const debug = debugFactory('@swc-node')

const tsconfig: ts.CompilerOptions = readDefaultTsConfig()
tsconfig.module = ts.ModuleKind.ESNext

const moduleResolutionCache = ts.createModuleResolutionCache(ts.sys.getCurrentDirectory(), (x) => x, tsconfig)
const host: ts.ModuleResolutionHost = {
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
}

const addShortCircuitSignal = <T extends ResolveFnOutput | LoadFnOutput>(input: T): T => {
  return {
    ...input,
    shortCircuit: true,
  }
}

interface PackageJson {
  name: string
  version: string
  type?: 'module' | 'commonjs'
  main?: string
}

const packageJSONCache = new Map<string, undefined | PackageJson>()

const readFileIfExists = async (path: string) => {
  try {
    const content = await readFile(path, 'utf-8')

    return JSON.parse(content)
  } catch (e) {
    // eslint-disable-next-line no-undef
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined
    }

    throw e
  }
}

const readPackageJSON = async (path: string) => {
  if (packageJSONCache.has(path)) {
    return packageJSONCache.get(path)
  }

  const res = (await readFileIfExists(path)) as PackageJson
  packageJSONCache.set(path, res)
  return res
}

const getPackageForFile = async (url: string) => {
  // use URL instead path.resolve to handle relative path
  let packageJsonURL = new URL('./package.json', url)

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const path = fileURLToPath(packageJsonURL)

    // for special case by some package manager
    if (path.endsWith('node_modules/package.json')) {
      break
    }

    const packageJson = await readPackageJSON(path)

    if (!packageJson) {
      const lastPath = packageJsonURL.pathname
      packageJsonURL = new URL('../package.json', packageJsonURL)

      // root level /package.json
      if (packageJsonURL.pathname === lastPath) {
        break
      }

      continue
    }

    if (packageJson.type && packageJson.type !== 'module' && packageJson.type !== 'commonjs') {
      packageJson.type = undefined
    }

    return packageJson
  }

  return undefined
}

export const getPackageType = async (url: string) => {
  const packageJson = await getPackageForFile(url)

  return packageJson?.type ?? undefined
}

const INTERNAL_MODULE_PATTERN = /^(node|nodejs):/

const EXTENSION_MODULE_MAP = {
  '.mjs': 'module',
  '.cjs': 'commonjs',
  '.ts': 'module',
  '.mts': 'module',
  '.cts': 'commonjs',
  '.json': 'json',
  '.wasm': 'wasm',
  '.node': 'commonjs',
} as const

export const resolve: ResolveHook = async (specifier, context, nextResolve) => {
  debug('resolve', specifier, JSON.stringify(context))

  if (INTERNAL_MODULE_PATTERN.test(specifier)) {
    debug('skip resolve: internal format', specifier)

    return addShortCircuitSignal({
      url: specifier,
      format: 'builtin',
    })
  }

  if (specifier.startsWith('data:')) {
    debug('skip resolve: data url', specifier)

    return addShortCircuitSignal({
      url: specifier,
    })
  }

  const parsedUrl = parseUrl(specifier)

  // as entrypoint, just return specifier
  if (!context.parentURL || parsedUrl.protocol === 'file:') {
    debug('skip resolve: absolute path or entrypoint', specifier)

    let format: ResolveFnOutput['format'] = null

    const specifierPath = fileURLToPath(specifier)
    const ext = extname(specifierPath)

    if (ext === '.js') {
      format = (await getPackageType(specifier)) === 'module' ? 'module' : 'commonjs'
    } else {
      format = EXTENSION_MODULE_MAP[ext as keyof typeof EXTENSION_MODULE_MAP]
    }

    return addShortCircuitSignal({
      url: specifier,
      format,
    })
  }

  // import attributes, support json currently
  if (context.importAttributes?.type) {
    debug('skip resolve: import attributes', specifier)

    return addShortCircuitSignal(await nextResolve(specifier))
  }

  const { resolvedModule } = ts.resolveModuleName(
    specifier.startsWith('file:') ? fileURLToPath(specifier) : specifier,
    fileURLToPath(context.parentURL),
    tsconfig,
    host,
    moduleResolutionCache,
  )

  // local project file
  if (
    resolvedModule &&
    !resolvedModule.resolvedFileName.includes('/node_modules/') &&
    AVAILABLE_TS_EXTENSION_PATTERN.test(resolvedModule.resolvedFileName)
  ) {
    debug('resolved: typescript', specifier, resolvedModule.resolvedFileName)

    return addShortCircuitSignal({
      ...context,
      url: pathToFileURL(resolvedModule.resolvedFileName).href,
      format: 'module',
    })
  }

  try {
    // files could not resolved by typescript or resolved as dts, fallback to use node resolver
    const res = await nextResolve(specifier)
    debug('resolved: fallback node', specifier, res.url, res.format)
    return addShortCircuitSignal(res)
  } catch (resolveError) {
    // fallback to cjs resolve as may import non-esm files
    try {
      const resolution = pathToFileURL(createRequire(process.cwd()).resolve(specifier)).toString()

      debug('resolved: fallback commonjs', specifier, resolution)

      return addShortCircuitSignal({
        format: 'commonjs',
        url: resolution,
      })
    } catch (error) {
      debug('resolved by cjs error', specifier, error)
      throw resolveError
    }
  }
}

const tsconfigForSWCNode = {
  ...tsconfig,
  paths: undefined,
  baseUrl: undefined,
}

export const load: LoadHook = async (url, context, nextLoad) => {
  debug('load', url, JSON.stringify(context))

  if (url.startsWith('data:')) {
    debug('skip load: data url', url)

    return nextLoad(url, context)
  }

  if (['builtin', 'json', 'wasm'].includes(context.format)) {
    debug('loaded: internal format', url)
    return nextLoad(url, context)
  }

  const { source, format: resolvedFormat } = await nextLoad(url, context)

  debug('loaded', url, resolvedFormat)

  const code = !source || typeof source === 'string' ? source : Buffer.from(source).toString()
  const compiled = await compile(code, url, tsconfigForSWCNode, true)

  debug('compiled', url, resolvedFormat)

  return addShortCircuitSignal({
    // for lazy: ts-node think format would undefined, actually it should not, keep it as original temporarily
    format: resolvedFormat,
    source: compiled,
  })
}
