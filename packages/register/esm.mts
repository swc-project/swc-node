import type { LoadHook, ResolveHook } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'url'

import ts from 'typescript'

// @ts-expect-error
import { readDefaultTsConfig } from '../lib/read-default-tsconfig.js'
// @ts-expect-error
import { AVAILABLE_EXTENSION_PATTERN, AVAILABLE_TS_EXTENSION_PATTERN, compile } from '../lib/register.js'

const tsconfig: ts.CompilerOptions = readDefaultTsConfig()
tsconfig.module = ts.ModuleKind.ESNext

const moduleResolutionCache = ts.createModuleResolutionCache(ts.sys.getCurrentDirectory(), (x) => x, tsconfig)
const host: ts.ModuleResolutionHost = {
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
}

export const resolve: ResolveHook = async (specifier, context, nextResolve) => {
  if (!AVAILABLE_EXTENSION_PATTERN.test(specifier)) {
    return nextResolve(specifier)
  }

  // entrypoint
  if (!context.parentURL) {
    return {
      importAttributes: {
        ...context.importAttributes,
        swc: 'entrypoint',
      },
      url: specifier,
      shortCircuit: true,
    }
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
    (!resolvedModule.resolvedFileName.includes('/node_modules/') ||
      AVAILABLE_TS_EXTENSION_PATTERN.test(resolvedModule.resolvedFileName))
  ) {
    return {
      url: pathToFileURL(resolvedModule.resolvedFileName).href,
      shortCircuit: true,
      importAttributes: {
        ...context.importAttributes,
        swc: resolvedModule.resolvedFileName,
      },
    }
  }

  // files could not resolved by typescript
  return nextResolve(specifier)
}

const tsconfigForSWCNode = {
  ...tsconfig,
  paths: undefined,
  baseUrl: undefined,
}

export const load: LoadHook = async (url, context, nextLoad) => {
  const swcAttribute = context.importAttributes.swc

  if (swcAttribute) {
    delete context.importAttributes.swc

    const { source } = await nextLoad(url, {
      ...context,
      format: 'ts' as any,
    })

    const code = !source || typeof source === 'string' ? source : Buffer.from(source).toString()
    const compiled = await compile(code, fileURLToPath(url), tsconfigForSWCNode, true)
    return {
      format: 'module',
      source: compiled,
      shortCircuit: true,
    }
  } else {
    return nextLoad(url, context)
  }
}
