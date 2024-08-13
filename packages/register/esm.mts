import { readFile } from 'node:fs/promises'
import {
  createRequire,
  type LoadFnOutput,
  type LoadHook,
  type ResolveFnOutput,
  type ResolveHook,
  builtinModules,
} from 'node:module'
import { extname, isAbsolute, join } from 'node:path'
import { fileURLToPath, parse as parseUrl, pathToFileURL } from 'node:url'

import debugFactory from 'debug'
import { EnforceExtension, ResolverFactory } from 'oxc-resolver'
import ts from 'typescript'

// @ts-expect-error
import { readDefaultTsConfig } from '../lib/read-default-tsconfig.js'
// @ts-expect-error
import { compile, DEFAULT_EXTENSIONS } from '../lib/register.js'

const debug = debugFactory('@swc-node')

const builtin = new Set(builtinModules)

const tsconfig: ts.CompilerOptions = readDefaultTsConfig()
tsconfig.module = ts.ModuleKind.ESNext

const TSCONFIG_PATH = (function () {
  const pathFromEnv =
    process.env.SWC_NODE_PROJECT ?? process.env.TS_NODE_PROJECT ?? join(process.cwd(), 'tsconfig.json')
  if (!isAbsolute(pathFromEnv)) {
    return join(process.cwd(), pathFromEnv)
  }
  return pathFromEnv
})()

const resolver = new ResolverFactory({
  tsconfig: {
    configFile: TSCONFIG_PATH,
    references: 'auto',
  },
  conditionNames: ['node', 'import'],
  enforceExtension: EnforceExtension.Auto,
  extensions: ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts', '.json', '.wasm', '.node'],
  extensionAlias: {
    '.js': ['.ts', '.tsx', '.js'],
    '.mjs': ['.mts', '.mjs'],
    '.cjs': ['.cts', '.cjs'],
  },
})

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

const EXTENSION_MODULE_MAP = {
  '.mjs': 'module',
  '.cjs': 'commonjs',
  '.ts': 'module',
  '.tsx': 'module',
  '.mts': 'module',
  '.cts': 'commonjs',
  '.json': 'json',
  '.wasm': 'wasm',
  '.node': 'commonjs',
} as const

export const resolve: ResolveHook = async (specifier, context, nextResolve) => {
  debug('resolve', specifier, JSON.stringify(context))

  if (specifier.startsWith('node:') || specifier.startsWith('nodejs:')) {
    debug('skip resolve: internal format', specifier)

    return addShortCircuitSignal({
      url: specifier,
      format: 'builtin',
    })
  }

  if (builtin.has(specifier)) {
    debug('skip resolve: internal format', specifier)

    return addShortCircuitSignal({
      url: `node:${specifier}`,
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

  const { error, path, moduleType } = await resolver.async(
    join(fileURLToPath(context.parentURL), '..'),
    specifier.startsWith('file:') ? fileURLToPath(specifier) : specifier,
  )

  if (error) {
    throw new Error(`${error}: ${specifier} cannot be resolved in ${context.parentURL}`)
  }

  // local project file
  if (path && isPathNotInNodeModules(path)) {
    debug('resolved: typescript', specifier, path)
    const url = new URL(join('file://', path))
    return addShortCircuitSignal({
      ...context,
      url: url.href,
      format:
        path.endsWith('cjs') || path.endsWith('cts') || moduleType === 'commonjs' || !moduleType
          ? 'commonjs'
          : moduleType === 'module'
            ? 'module'
            : 'commonjs',
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

  if (url.includes('/node_modules/')) {
    debug('skip load: node_modules', url)

    return nextLoad(url, context)
  }

  if (['builtin', 'json', 'wasm'].includes(context.format)) {
    debug('loaded: internal format', url)
    return nextLoad(url, context)
  }

  const { source, format: resolvedFormat } = await nextLoad(url, context)

  if (!source) {
    debug('No source', url, resolvedFormat)
    return {
      source,
      format: resolvedFormat,
    }
  }

  debug('loaded', url, resolvedFormat)

  const code = !source || typeof source === 'string' ? source : Buffer.from(source).toString()

  // url may be essentially an arbitrary string, but fixing the binding module, which currently
  // expects a real file path, to correctly interpret this doesn't have an obvious solution,
  // and would likely be a breaking change anyway. Do a best effort to give a real path
  // like it expects, which at least fixes relative input sourcemap paths.
  const filename = url.startsWith('file:') ? fileURLToPath(url) : url
  const compiled = await compile(code, filename, tsconfigForSWCNode, true)

  debug('compiled', url, resolvedFormat)

  return addShortCircuitSignal({
    // for lazy: ts-node think format would undefined, actually it should not, keep it as original temporarily
    format: resolvedFormat,
    source: compiled,
  })
}

function isPathNotInNodeModules(path: string) {
  return (
    (process.platform !== 'win32' && !path.includes('/node_modules/')) ||
    (process.platform === 'win32' && !path.includes('\\node_modules\\'))
  )
}
