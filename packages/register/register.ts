import { extname } from 'node:path'

import { Options, transform, transformSync } from '@swc-node/core'
import { installSourceMapSupport, SourcemapMap } from '@swc-node/sourcemap-support'
import { addHook } from 'pirates'
import * as ts from 'typescript'

import { readDefaultTsConfig, tsCompilerOptionsToSwcConfig } from './read-default-tsconfig'
import { createCacheKey, getCachedTransform, setCachedTransform } from './transform-cache'

const LooksLikeEsmSyntaxRegex = /(?:^|\n)\s*import\s|(?:^|\n)\s*export\s|\bimport\.meta\b/

const DEFAULT_EXTENSIONS = new Set([
  ts.Extension.Js,
  ts.Extension.Ts,
  ts.Extension.Jsx,
  ts.Extension.Tsx,
  ts.Extension.Mjs,
  ts.Extension.Mts,
  ts.Extension.Cjs,
  ts.Extension.Cts,
  '.es6',
  '.es',
])

const JS_RUNTIME_EXTENSIONS = new Set([ts.Extension.Js, ts.Extension.Mjs, ts.Extension.Cjs, '.es6', '.es'])

// Runtime knobs here are process-scoped and comparatively cheap to read, so
// they gate cache safety without paying per-module deep serialization costs.
const CacheRuntimeSalt = [
  process.env.SWCRC ? 'swcrc=1' : 'swcrc=0',
  `swcConfig=${process.env.SWC_CONFIG_FILE ?? ''}`,
  `sourceMapMode=${process.env.SWC_NODE_SOURCE_MAP_MODE ?? 'auto'}`,
].join(';')

const injectInlineSourceMap = ({
  filename,
  code,
  map,
}: {
  filename: string
  code: string
  map: string | undefined
}): string => {
  if (!map) {
    return code
  }

  // Choose map storage strategy at emit time so one process can tune behavior
  // per runtime profile (debuggability vs memory) without rebuilds.
  const sourceMapMode = getSourceMapMode()
  if (sourceMapMode.store) {
    SourcemapMap.set(filename, map)
  }

  if (sourceMapMode.inline) {
    const base64Map = Buffer.from(map, 'utf8').toString('base64')
    const sourceMapContent = `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${base64Map}`
    return `${code}\n${sourceMapContent}`
  }

  return code
}

export function compile(
  sourcecode: string | undefined,
  filename: string,
  options: ts.CompilerOptions & {
    fallbackToTs?: (filename: string) => boolean
  },
): string

export function compile(
  sourcecode: string | undefined,
  filename: string,
  options: ts.CompilerOptions & {
    fallbackToTs?: (filename: string) => boolean
  },
  async: false,
): string

export function compile(
  sourcecode: string | undefined,
  filename: string,
  options: ts.CompilerOptions & {
    fallbackToTs?: (filename: string) => boolean
  },
  async: true,
): Promise<string>

export function compile(
  sourcecode: string | undefined,
  filename: string,
  options: ts.CompilerOptions & {
    fallbackToTs?: (filename: string) => boolean
  },
  async: boolean,
): string | Promise<string>

export function compile(
  sourcecode: string | undefined,
  filename: string,
  options: ts.CompilerOptions & {
    fallbackToTs?: (filename: string) => boolean
  },
  async = false,
) {
  if (sourcecode == null) {
    return
  }

  const fallbackToTs = Boolean(options && typeof options.fallbackToTs === 'function' && options.fallbackToTs(filename))

  delete options.fallbackToTs

  // Fast-path before cache work for files intentionally left as runtime JS.
  // This keeps cache logs meaningful and avoids unnecessary key generation.
  if (!fallbackToTs && shouldSkipTransformForRuntimeJs(filename, sourcecode, options)) {
    logCacheDebug('skip', filename)
    return sourcecode
  }

  const cacheInput = {
    sourcecode,
    filename,
    options,
    fallbackToTs,
    runSalt: CacheRuntimeSalt,
  }

  const cacheKey = createCacheKey(cacheInput)
  const cacheEntry = getCachedTransform(cacheKey)
  if (cacheEntry) {
    // Keep source-map behavior consistent for cache hits, otherwise stack trace
    // semantics would differ between warm and cold compiles.
    return injectInlineSourceMap({ filename, code: cacheEntry.code, map: cacheEntry.map })
  }

  if (fallbackToTs) {
    const { outputText, sourceMapText } = ts.transpileModule(sourcecode, {
      fileName: filename,
      compilerOptions: options,
    })

    setCachedTransform(cacheKey, { code: outputText, map: sourceMapText })
    return injectInlineSourceMap({ filename, code: outputText, map: sourceMapText })
  }

  let swcRegisterConfig: Options
  if (process.env.SWCRC) {
    // when SWCRC environment variable is set to true it will use swcrc file
    swcRegisterConfig = {
      swc: {
        swcrc: true,
        configFile: process.env.SWC_CONFIG_FILE,
      },
    }
  } else {
    swcRegisterConfig = tsCompilerOptionsToSwcConfig(options, filename)
  }

  if (async) {
    return transform(sourcecode, filename, swcRegisterConfig).then(({ code, map }) => {
      setCachedTransform(cacheKey, { code, map })
      return injectInlineSourceMap({ filename, code, map })
    })
  } else {
    const { code, map } = transformSync(sourcecode, filename, swcRegisterConfig)
    setCachedTransform(cacheKey, { code, map })
    return injectInlineSourceMap({ filename, code, map })
  }
}

export function register(options: Partial<ts.CompilerOptions> = {}, hookOpts = {}) {
  if (!process.env.SWCRC) {
    options = Object.keys(options).length ? options : readDefaultTsConfig()
  }
  options.module = ts.ModuleKind.CommonJS

  // Install source-map-support only when map-store mode is active; with inline
  // mode and native source maps, this avoids duplicate map retention.
  if (getSourceMapMode().store) {
    installSourceMapSupport()
  }

  return addHook((code, filename) => compile(code, filename, options), {
    exts: Array.from(DEFAULT_EXTENSIONS),
    ...hookOpts,
  })
}

function getSourceMapMode(): { inline: boolean; store: boolean } {
  switch (process.env.SWC_NODE_SOURCE_MAP_MODE?.trim().toLowerCase()) {
    case 'both':
      return { inline: true, store: true }
    case 'inline':
      return { inline: true, store: false }
    case 'store':
      return { inline: false, store: true }
    case 'none':
      return { inline: false, store: false }
  }

  // In auto mode, follow runtime capability: native source maps favor inline,
  // non-native stacks favor store mode.
  return process.sourceMapsEnabled ? { inline: true, store: false } : { inline: false, store: true }
}

function shouldSkipTransformForRuntimeJs(filename: string, sourcecode: string, options: ts.CompilerOptions): boolean {
  // Respect SWCRC workflows first. When users opt into external SWC config,
  // consistency with that config takes priority over local fast-path heuristics.
  if (process.env.SWCRC) {
    return false
  }

  const extension = extname(filename).toLowerCase()
  if (!JS_RUNTIME_EXTENSIONS.has(extension)) {
    return false
  }

  const moduleKind = options.module ?? ts.ModuleKind.ES2015
  if (moduleKind !== ts.ModuleKind.CommonJS) {
    return true
  }

  // CommonJS mode is where accidental ESM-in-JS files usually break at runtime,
  // so we keep the transform path only when file content indicates that risk.
  return !LooksLikeEsmSyntaxRegex.test(sourcecode)
}
