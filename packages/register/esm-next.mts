import { readFileSync } from 'node:fs'
import { createRequire, type LoadHookSync, type ResolveHookSync } from 'node:module'
import { join } from 'node:path'
import { URL, pathToFileURL } from 'node:url'

// @ts-expect-error
import { compile } from '../lib/register.js'
// @ts-expect-error
import { shouldSkipTransformForRuntimeJs } from '../lib/transform-cache.js'
import {
  type PackageJson,
  addShortCircuitSignal,
  debug,
  formatForResolvedPath,
  formatFromExtension,
  getCompilerOptions,
  getResolver,
  isPathNotInNodeModules,
  packageJSONCache,
  packageJSONPathsFor,
  parsePackageJSON,
  planResolve,
  planTransform,
  shouldDelegateLoad,
} from './esm-shared.mjs'

const readFileIfExists = (path: string) => {
  try {
    const content = readFileSync(path, 'utf-8')

    return parsePackageJSON(content)
  } catch (e) {
    // eslint-disable-next-line no-undef
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined
    }

    throw e
  }
}

const readPackageJSON = (path: string) => {
  if (packageJSONCache.has(path)) {
    return packageJSONCache.get(path)
  }

  const res = readFileIfExists(path) as PackageJson
  packageJSONCache.set(path, res)
  return res
}

function getModuleType(path: string): 'module' | 'commonjs' | undefined {
  return readPackageJSON(path)?.type
}

export const getPackageType = (url: string) => {
  for (const path of packageJSONPathsFor(url)) {
    const packageJson = readPackageJSON(path)

    if (packageJson) {
      return packageJson.type ?? undefined
    }
  }

  return undefined
}

export const resolve: ResolveHookSync = (specifier, context, nextResolve) => {
  debug('resolve', specifier, JSON.stringify(context))

  const resolver = getResolver(context.conditions)
  // Builtins are handed down the chain: these hooks run ahead of the ones
  // registered with `module.register()`, and claiming `node:*` here would hide
  // builtins from loaders that mock them.
  const plan = planResolve(specifier, context, { shortCircuitBuiltins: false })

  if (plan.kind === 'result') {
    return plan.output
  }

  if (plan.kind === 'next') {
    return addShortCircuitSignal(nextResolve(specifier))
  }

  if (plan.kind === 'entrypoint') {
    const format =
      plan.ext === '.js'
        ? getPackageType(plan.url) === 'module'
          ? 'module'
          : 'commonjs'
        : formatFromExtension(plan.ext)

    return addShortCircuitSignal({
      url: plan.url,
      format,
    })
  }

  const { error, path, moduleType, packageJsonPath } = resolver.sync(plan.parentDir, plan.request)

  if (error) {
    debug('oxc-resolver error, falling back to node resolver', specifier, error)
    try {
      return addShortCircuitSignal(nextResolve(specifier))
    } catch (resolveError) {
      throw new Error(`${error}: ${specifier} cannot be resolved in ${context.parentURL}`)
    }
  }

  // local project file
  if (path && isPathNotInNodeModules(path)) {
    debug('resolved: typescript', specifier, moduleType, path)
    const url = new URL('file://' + join(path))
    const mt = moduleType ?? (packageJsonPath ? getModuleType(packageJsonPath) : null)

    return addShortCircuitSignal({
      ...context,
      url: url.href,
      format: formatForResolvedPath(path, mt),
    })
  }

  try {
    // files could not resolved by typescript or resolved as dts, fallback to use node resolver
    const res = nextResolve(specifier)
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

export const load: LoadHookSync = (url, context, nextLoad) => {
  debug('load', url, JSON.stringify(context))

  if (shouldDelegateLoad(url, context)) {
    return nextLoad(url, context)
  }

  const loaded = nextLoad(url, context)
  // Unlike the asynchronous hooks, the source returned here is what the CommonJS
  // loader evaluates, so a file resolved as CommonJS must be emitted as CommonJS.
  const plan = planTransform(url, loaded, getCompilerOptions(loaded.format), shouldSkipTransformForRuntimeJs)

  if (plan.kind === 'passthrough') {
    return plan.output
  }

  const compiled = compile(plan.code, plan.filename, plan.options, false)

  debug('compiled', url, plan.format)

  return addShortCircuitSignal({
    format: plan.format,
    source: compiled,
  })
}
