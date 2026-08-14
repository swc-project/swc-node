import {
  type LoadFnOutput,
  type LoadHookContext,
  type ResolveFnOutput,
  type ResolveHookContext,
  builtinModules,
} from 'node:module'
import { extname, isAbsolute, join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import debugFactory from 'debug'
import { EnforceExtension, ResolverFactory, type NapiResolveOptions } from 'oxc-resolver'
import ts from 'typescript'

// @ts-expect-error
import { readDefaultTsConfig } from '../lib/read-default-tsconfig.js'

export const debug = debugFactory('@swc-node')

const builtin = new Set(builtinModules)

const tsconfig: ts.CompilerOptions = readDefaultTsConfig()
tsconfig.module = ts.ModuleKind.ESNext

export const TSCONFIG_PATH = (function () {
  const pathFromEnv =
    process.env.SWC_NODE_PROJECT ?? process.env.TS_NODE_PROJECT ?? join(process.cwd(), 'tsconfig.json')
  if (!isAbsolute(pathFromEnv)) {
    return join(process.cwd(), pathFromEnv)
  }
  return pathFromEnv
})()

// `paths`/`baseUrl` are resolved by oxc-resolver in the resolve hook, so they must
// not be applied a second time by swc when the source is transformed.
export const tsconfigForSWCNode = {
  ...tsconfig,
  paths: undefined,
  baseUrl: undefined,
}

// The synchronous hooks feed their output straight into the CommonJS loader, so a
// file resolved as CommonJS has to be emitted as CommonJS. Cache both variants
// because `compile` derives its cache key from these objects.
const tsconfigForCommonJS = {
  ...tsconfigForSWCNode,
  module: ts.ModuleKind.CommonJS,
}

export const getCompilerOptions = (format: string | null | undefined) =>
  format === 'commonjs' ? tsconfigForCommonJS : tsconfigForSWCNode

export const addShortCircuitSignal = <T extends ResolveFnOutput | LoadFnOutput>(input: T): T => {
  return {
    ...input,
    shortCircuit: true,
  }
}

export interface PackageJson {
  name: string
  version: string
  type?: 'module' | 'commonjs'
  main?: string
}

export const packageJSONCache = new Map<string, undefined | PackageJson>()

export const parsePackageJSON = (content: string): PackageJson => {
  const packageJson = JSON.parse(content) as PackageJson

  if (packageJson?.type && packageJson.type !== 'module' && packageJson.type !== 'commonjs') {
    packageJson.type = undefined
  }

  return packageJson
}

/**
 * Yields the `package.json` paths to probe for `url`, nearest first, applying the
 * same stop conditions for both the asynchronous and the synchronous loader: give
 * up at a package manager's `node_modules/package.json` and at the filesystem root.
 */
export function* packageJSONPathsFor(url: string): Generator<string> {
  // use URL instead path.resolve to handle relative path
  let packageJsonURL = new URL('./package.json', url)

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const path = fileURLToPath(packageJsonURL)

    // for special case by some package manager
    if (path.endsWith('node_modules/package.json')) {
      return
    }

    yield path

    const lastPath = packageJsonURL.pathname
    packageJsonURL = new URL('../package.json', packageJsonURL)

    // root level /package.json
    if (packageJsonURL.pathname === lastPath) {
      return
    }
  }
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

// Source extensions swc-node is responsible for transforming. A file: URL import
// that lands on one of these must flow through the resolver/transform below
// instead of the runtime dynamic-import fast path, otherwise the file is loaded
// untransformed (this is how test runners such as AVA import `.ts` test files).
// Already-runnable files (.mjs/.cjs/…) keep the native fast path that #883 needs.
const TRANSFORMABLE_SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx'])

let conditions: string[] | undefined = undefined

const resolverOptions: NapiResolveOptions = {
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
  moduleType: true,
}

let resolver = new ResolverFactory(resolverOptions)

/**
 * The conditions Node.js runs with are only known once the first resolution comes
 * in, so the resolver is rebuilt on the first call and reused afterwards.
 */
export const getResolver = (hookConditions: string[]) => {
  if (!conditions) {
    conditions = hookConditions
    resolver = resolver.cloneWithOptions({
      ...resolverOptions,
      conditionNames: conditions,
    })
  }

  return resolver
}

export const formatFromExtension = (ext: string): ResolveFnOutput['format'] =>
  EXTENSION_MODULE_MAP[ext as keyof typeof EXTENSION_MODULE_MAP] ?? null

export const formatForResolvedPath = (
  path: string,
  moduleType: string | null | undefined,
): ResolveFnOutput['format'] =>
  path.endsWith('cjs') || path.endsWith('cts') || moduleType === 'commonjs' || !moduleType
    ? 'commonjs'
    : moduleType === 'module'
      ? 'module'
      : 'commonjs'

export const isPathNotInNodeModules = (path: string) => {
  return (
    (process.platform !== 'win32' && !path.includes('/node_modules/')) ||
    (process.platform === 'win32' && !path.includes('\\node_modules\\'))
  )
}

export const parseUrl =
  typeof URL.parse === 'function'
    ? URL.parse
    : (url: string) => {
        try {
          return new URL(url)
        } catch {
          return null
        }
      }

/**
 * What the resolve hook has to do after the specifier has been classified.
 *
 * The classification itself never touches the filesystem, which lets the
 * asynchronous and the synchronous loader share every routing decision and differ
 * only in how they perform the IO each branch asks for.
 */
export type ResolvePlan =
  /** Fully resolved without IO. */
  | { kind: 'result'; output: ResolveFnOutput }
  /** Defer to the next hook in the chain. */
  | { kind: 'next' }
  /** An entrypoint or absolute file URL: the format follows from the extension. */
  | { kind: 'entrypoint'; url: string; ext: string }
  /** A bare or relative specifier that has to go through oxc-resolver. */
  | { kind: 'resolve'; parentDir: string; request: string }

export interface PlanResolveOptions {
  /**
   * Whether builtin specifiers may be answered without consulting the rest of the
   * chain. Synchronous hooks run ahead of the hooks registered with
   * `module.register()`, so short-circuiting there would hide builtins from
   * loaders that mock them (esmock, quibble, …).
   */
  shortCircuitBuiltins?: boolean
}

export const planResolve = (
  specifier: string,
  context: ResolveHookContext,
  { shortCircuitBuiltins = true }: PlanResolveOptions = {},
): ResolvePlan => {
  if (specifier.startsWith('node:') || specifier.startsWith('nodejs:')) {
    debug('skip resolve: internal format', specifier)

    return shortCircuitBuiltins
      ? {
          kind: 'result',
          output: addShortCircuitSignal({
            url: specifier,
            format: 'builtin',
          }),
        }
      : { kind: 'next' }
  }

  if (builtin.has(specifier)) {
    debug('skip resolve: internal format', specifier)

    return shortCircuitBuiltins
      ? {
          kind: 'result',
          output: addShortCircuitSignal({
            url: `node:${specifier}`,
            format: 'builtin',
          }),
        }
      : { kind: 'next' }
  }

  if (specifier.startsWith('data:')) {
    debug('skip resolve: data url', specifier)

    return {
      kind: 'result',
      output: addShortCircuitSignal({
        url: specifier,
      }),
    }
  }

  const parsedUrl = parseUrl(specifier)

  // A file: URL specifier that arrives with a parentURL is either a runtime
  // dynamic import (`await import('file://…')`, see #883) or a test runner such
  // as AVA importing a source file. When it points at a source file swc-node is
  // responsible for transforming, let it fall through to the resolver/transform
  // below; skipping it would load the raw, untransformed source. Files Node can
  // already execute (.mjs/.cjs/…) keep the native fast path that #883 needs.
  const isParentedFileUrl = Boolean(context.parentURL) && parsedUrl?.protocol === 'file:'
  const shouldTransformParentedFileUrl =
    isParentedFileUrl && TRANSFORMABLE_SOURCE_EXTENSIONS.has(extname(parsedUrl!.pathname).toLowerCase())

  if (isParentedFileUrl && !shouldTransformParentedFileUrl) {
    debug('skip resolve: dynamic import', specifier)

    return {
      kind: 'result',
      output: addShortCircuitSignal({
        ...context,
        url: specifier,
        importAttributes: {
          ...context.importAttributes,
          dynamic: 'true',
        },
      }),
    }
  }

  // as entrypoint, just return specifier
  if (!context.parentURL || parsedUrl?.protocol === 'file:') {
    debug('skip resolve: absolute path or entrypoint', specifier)

    return {
      kind: 'entrypoint',
      url: specifier,
      ext: extname(fileURLToPath(specifier)),
    }
  }

  // import attributes, support json currently
  if (context.importAttributes?.type) {
    debug('skip resolve: import attributes', specifier)

    return { kind: 'next' }
  }

  return {
    kind: 'resolve',
    parentDir: join(fileURLToPath(context.parentURL), '..'),
    request: specifier.startsWith('file:') ? fileURLToPath(specifier) : specifier,
  }
}

/**
 * Decides whether a URL is swc-node's business at all, before any source is read.
 */
export const shouldDelegateLoad = (url: string, context: LoadHookContext): boolean => {
  // `require()` reaches the synchronous hooks without any import attributes.
  if (context.importAttributes?.dynamic === 'true') {
    debug('skip load: dynamic file url', url)
    delete context.importAttributes.dynamic
    return true
  }

  if (url.startsWith('data:')) {
    debug('skip load: data url', url)
    return true
  }

  if (url.includes('/node_modules/')) {
    debug('skip load: node_modules', url)
    return true
  }

  if (context.format && ['builtin', 'json', 'wasm'].includes(context.format)) {
    debug('loaded: internal format', url)
    return true
  }

  // import attributes are handled by the default loader,
  // e.g. `with { type: 'text' }` since Node.js 26.5 (behind --experimental-import-text)
  if (context.importAttributes?.type) {
    debug('skip load: import attributes', url)
    return true
  }

  return false
}

/**
 * What to do with the source the next hook in the chain produced.
 */
export type TransformPlan =
  /** Nothing to compile: hand the loaded output back untouched. */
  | { kind: 'passthrough'; output: LoadFnOutput }
  /** Compile `code` with `options` and emit it as `format`. */
  | {
      kind: 'compile'
      filename: string
      code: string
      format: LoadFnOutput['format']
      options: typeof tsconfigForSWCNode
    }

export const planTransform = (
  url: string,
  { source, format }: LoadFnOutput,
  options: typeof tsconfigForSWCNode,
  shouldSkipTransformForRuntimeJs: (
    filename: string,
    code: string,
    module: ts.ModuleKind | undefined,
    jsx: boolean,
  ) => boolean,
): TransformPlan => {
  if (!source) {
    debug('No source', url, format)

    return {
      kind: 'passthrough',
      output: {
        source,
        format,
      },
    }
  }

  debug('loaded', url, format)

  const code = typeof source === 'string' ? source : Buffer.from(source as ArrayBuffer).toString()

  // url may be essentially an arbitrary string, but fixing the binding module, which currently
  // expects a real file path, to correctly interpret this doesn't have an obvious solution,
  // and would likely be a breaking change anyway. Do a best effort to give a real path
  // like it expects, which at least fixes relative input sourcemap paths.
  const filename = url.startsWith('file:') ? fileURLToPath(url) : url

  if (shouldSkipTransformForRuntimeJs(filename, code, options.module, Boolean(options.jsx))) {
    debug('skip compile: runtime js module', url)

    return {
      kind: 'passthrough',
      output: addShortCircuitSignal({
        format,
        source,
      }),
    }
  }

  return { kind: 'compile', filename, code, format, options }
}
