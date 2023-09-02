import { fileURLToPath, pathToFileURL } from 'url'

import ts from 'typescript'

// @ts-expect-error
import { readDefaultTsConfig } from '../lib/read-default-tsconfig.js'
// @ts-expect-error
import { compile } from '../lib/register.js'

interface ResolveContext {
  conditions: string[]
  parentURL: string | undefined
}
interface ResolveResult {
  format?: string
  shortCircuit?: boolean
  url: string
}
type ResolveArgs = [
  specifier: string,
  context?: ResolveContext,
  nextResolve?: (...args: ResolveArgs) => Promise<ResolveResult>,
]
type ResolveFn = (...args: Required<ResolveArgs>) => Promise<ResolveResult>

const tsconfig: ts.CompilerOptions = readDefaultTsConfig()
tsconfig.module = ts.ModuleKind.ESNext

const moduleResolutionCache = ts.createModuleResolutionCache(ts.sys.getCurrentDirectory(), (x) => x, tsconfig)
const host: ts.ModuleResolutionHost = {
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
}
function resolveModuleName(specifier: string, parentURL: string) {
  return ts.resolveModuleName(specifier, fileURLToPath(parentURL), tsconfig, host, moduleResolutionCache)
}

export const resolve: ResolveFn = async (specifier, context, nextResolve) => {
  const { parentURL } = context ?? {}
  if (parentURL) {
    const { resolvedModule } = resolveModuleName(specifier, parentURL)
    if (resolvedModule && !resolvedModule.isExternalLibraryImport) {
      return {
        format: 'ts',
        url: pathToFileURL(resolvedModule.resolvedFileName).href,
        shortCircuit: true,
      }
    } else {
      return nextResolve(specifier)
    }
  } else {
    return {
      format: 'ts',
      url: specifier,
      shortCircuit: true,
    }
  }
}

interface LoadContext {
  conditions: string[]
  format: string | null | undefined
}
interface LoadResult {
  format: string
  shortCircuit?: boolean
  source: string | ArrayBuffer | SharedArrayBuffer | Uint8Array
}
type LoadArgs = [url: string, context: LoadContext, nextLoad?: (...args: LoadArgs) => Promise<LoadResult>]
type LoadFn = (...args: Required<LoadArgs>) => Promise<LoadResult>

export const load: LoadFn = async (url, context, nextLoad) => {
  if (context.format === 'ts') {
    const { source } = await nextLoad(url, context)
    const code = typeof source === 'string' ? source : Buffer.from(source).toString()
    const compiled = await compile(code, url, tsconfig, true)
    return {
      format: 'module',
      source: compiled,
      shortCircuit: true,
    }
  } else {
    return nextLoad(url, context)
  }
}
