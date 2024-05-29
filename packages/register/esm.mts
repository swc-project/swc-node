import { createRequire, type LoadFnOutput, type LoadHook, type ResolveFnOutput, type ResolveHook } from 'node:module'
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

const INTERNAL_MODULE_PATTERN = /^(data|node|nodejs):/

export const resolve: ResolveHook = async (specifier, context, nextResolve) => {
  debug('resolve', specifier, JSON.stringify(context))

  if (INTERNAL_MODULE_PATTERN.test(specifier)) {
    debug('resolved original caused by internal format', specifier)

    return addShortCircuitSignal({
      url: specifier,
    })
  }

  const parsedUrl = parseUrl(specifier)

  // as entrypoint, just return specifier
  if (!context.parentURL || parsedUrl.protocol === 'file:') {
    debug('resolved original caused by protocol', specifier)
    return addShortCircuitSignal({
      url: specifier,
      format: 'module',
    })
  }

  // import attributes, support json currently
  if (context.importAttributes?.type) {
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
    debug('resolved by typescript', specifier, resolvedModule.resolvedFileName)

    return addShortCircuitSignal({
      ...context,
      url: pathToFileURL(resolvedModule.resolvedFileName).href,
      format: 'module',
    })
  }

  try {
    // files could not resolved by typescript or resolved as dts, fallback to use node resolver
    const res = await nextResolve(specifier)
    debug('fallback resolved by node', specifier, res.url, res.format)
    return addShortCircuitSignal(res)
  } catch (resolveError) {
    // fallback to cjs resolve as may import non-esm files
    try {
      const resolution = pathToFileURL(createRequire(process.cwd()).resolve(specifier)).toString()

      debug('resolved by node commonjs', specifier, resolution)

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

  if (['builtin', 'json', 'wasm'].includes(context.format)) {
    debug('load original caused by internal format', url)
    return nextLoad(url, context)
  }

  const { source, format } = await nextLoad(url, {
    ...context,
  })

  debug('loaded', url, format)

  const code = !source || typeof source === 'string' ? source : Buffer.from(source).toString()
  const compiled = await compile(code, url, tsconfigForSWCNode, true)

  debug('compiled', url, format)

  return addShortCircuitSignal({
    // for lazy: ts-node think format would undefined, actually it should not, keep it as original temporarily
    format,
    source: compiled,
  })
}
