import fs from 'node:fs'
import path from 'node:path'
import * as ts from 'typescript'
import { createHash } from 'node:crypto'
import { tmpdir, userInfo } from 'node:os'
import { join } from 'node:path'
import debugFactory from 'debug'
import stableStringify from 'json-stable-stringify'

const LOOKS_LIKE_ESM_SYNTAX_REGEX = /(?:^|\n)\s*import\s|(?:^|\n)\s*export\s|\bimport\.meta\b/

// Strong JSX signals: a closing element `</Tag`, a self-closing element
// `<Tag ... />`, or a fragment `<>`. These are rare in plain JS (a `<`/`>`
// comparison matches none of them), so a hit reliably means the file needs the
// JSX transform and must not be skipped.
const LOOKS_LIKE_JSX_REGEX = /<\/[A-Za-z]|<[A-Za-z][^>]*\/>|<>/

const JS_RUNTIME_EXTENSIONS = new Set([ts.Extension.Js, ts.Extension.Mjs, ts.Extension.Cjs, '.es6', '.es'])

interface TransformCacheEntry {
  code: string
  map?: string
}

interface TransformCacheKeyInput {
  sourcecode: string
  filename: string
  options: Record<string, unknown>
  fallbackToTs: boolean
  runSalt: string
}

const debug = debugFactory('@swc-node')

const CACHE_ENABLED = isEnabled(process.env.SWC_NODE_CACHE, true)
const MEMORY_CACHE_LIMIT = Number(process.env.SWC_NODE_CACHE_MEMORY_LIMIT ?? '2000')

// A stable per-user segment so the on-disk cache is shared across runs by the
// same user. Windows has no getuid(); falling back to the pid there would give
// every process a throwaway directory and defeat the disk cache entirely.
function cacheUserSegment(): string {
  if (typeof process.getuid === 'function') {
    return String(process.getuid())
  }
  try {
    const name = userInfo().username
    if (name) {
      return name.replace(/[^a-zA-Z0-9_-]/g, '_')
    }
  } catch {
    // userInfo() can throw when there is no backing passwd entry.
  }
  return 'default'
}

// Resolved lazily rather than frozen at import time so SWC_NODE_CACHE_DIR is
// honored whenever it is set (including by tests) and getTransformCacheDirectory
// always reflects the current value.
function getCacheDirectory(): string {
  return process.env.SWC_NODE_CACHE_DIR ?? join(tmpdir(), `swc-node-${cacheUserSegment()}`)
}

if (!Number.isFinite(MEMORY_CACHE_LIMIT) || MEMORY_CACHE_LIMIT < 0) {
  throw new Error(`Invalid value for SWC_NODE_CACHE_MEMORY_LIMIT: ${process.env.SWC_NODE_CACHE_MEMORY_LIMIT}`)
}

const REGISTER_VERSION = readPackageVersion('../package.json')
const SWC_VERSION = readPackageVersion('@swc/core/package.json')

const memoryCache = new Map<string, TransformCacheEntry>()
let optionsSignatureCache = new WeakMap<Record<string, unknown>, string>()
let ensuredCacheDirectory: string | undefined
let diskWriteCounter = 0

export function getCachedTransform(cacheKey: string): TransformCacheEntry | undefined {
  if (!CACHE_ENABLED) {
    return undefined
  }

  const memoryValue = memoryCache.get(cacheKey)

  if (memoryValue) {
    return memoryValue
  }

  const diskValue = readDiskCache(cacheKey)

  if (diskValue) {
    setMemoryCache(cacheKey, diskValue)
  }

  return diskValue
}

export function setCachedTransform(cacheKey: string, value: TransformCacheEntry) {
  if (!CACHE_ENABLED) {
    return
  }

  setMemoryCache(cacheKey, value)
  writeDiskCache(cacheKey, value)
}

export function createCacheKey(input: TransformCacheKeyInput): string {
  // Keep cache reuse scoped to both source intent and toolchain version so
  // stale compiled output is not reused across upgrades/config changes.
  const hash = createHash('sha1')
  hash.update(input.sourcecode)
  hash.update('\0')
  hash.update(input.filename)
  hash.update('\0')
  hash.update(input.fallbackToTs ? 'ts' : 'swc')
  hash.update('\0')
  hash.update(getOptionsSignature(input.options))
  hash.update('\0')
  hash.update(input.runSalt)
  hash.update('\0')
  hash.update(`register:${REGISTER_VERSION};swc:${SWC_VERSION}`)
  return hash.digest('hex')
}

function getOptionsSignature(options: Record<string, unknown>): string {
  const cached = optionsSignatureCache.get(options)
  if (cached) {
    return cached
  }

  // Options are usually reused for most compiles in one process; cache the
  // normalized signature so hash generation stays near O(source length).
  const signature = stableStringify(options)!
  optionsSignatureCache.set(options, signature)
  return signature
}

function setMemoryCache(key: string, value: TransformCacheEntry) {
  memoryCache.set(key, value)

  // Bound in-process retention for long-lived services where many modules
  // may be touched once and never needed again.
  while (memoryCache.size > MEMORY_CACHE_LIMIT) {
    const oldestKey = memoryCache.keys().next().value

    if (!oldestKey) {
      break
    }

    memoryCache.delete(oldestKey)
  }
}

function readDiskCache(key: string): TransformCacheEntry | undefined {
  try {
    const directory = ensureCacheDirectory()
    const file = fs.readFileSync(join(directory, `${key}.json`), 'utf8')
    return JSON.parse(file) as TransformCacheEntry
  } catch (error) {
    debug('Failed to read cache file', error)
    return undefined
  }
}

function writeDiskCache(key: string, value: TransformCacheEntry) {
  const directory = ensureCacheDirectory()
  const target = join(directory, `${key}.json`)

  // Write to a unique temp file then atomically rename into place. A crash or
  // concurrent writer can then only leave a stray .tmp file, never a
  // partial/zero-byte entry that a reader could observe at the final path.
  // Writes stay non-blocking (fire-and-forget).
  const tmp = `${target}.${process.pid}.${diskWriteCounter++}.tmp`

  void fs.promises
    .writeFile(tmp, JSON.stringify(value), 'utf8')
    .then(() => fs.promises.rename(tmp, target))
    .catch((error) => {
      debug('Failed to write cache file', error)
      void fs.promises.rm(tmp, { force: true }).catch(() => {})
    })
}

function ensureCacheDirectory(): string {
  const directory = getCacheDirectory()

  if (ensuredCacheDirectory !== directory) {
    fs.mkdirSync(directory, { recursive: true })
    ensuredCacheDirectory = directory
  }

  // Note that we do not attempt to clean up old cache files since we store it
  // on tmpdir and we assume the OS take care of that.
  return directory
}

function readPackageVersion(path: string): string {
  try {
    return require(path).version ?? 'unknown'
  } catch (error) {
    debug(`Failed to read package ${path} version`, error)
    return 'unknown'
  }
}

function isEnabled(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback
  }
  const normalized = value.trim().toLowerCase()
  return normalized !== '0' && normalized !== 'false' && normalized !== 'off' && normalized !== 'no'
}

export function clearTransformCache(options: { memory?: boolean; disk?: boolean } = {}) {
  const { memory = true, disk = true } = options

  if (memory) {
    memoryCache.clear()
    optionsSignatureCache = new WeakMap<Record<string, unknown>, string>()
  }

  if (disk) {
    try {
      fs.rmSync(getCacheDirectory(), { recursive: true, force: true })
    } catch (error) {
      debug('Failed to clear cache directory', error)
    }

    ensuredCacheDirectory = undefined
  }
}

export function getTransformCacheDirectory() {
  return getCacheDirectory()
}

export function shouldSkipTransformForRuntimeJs(
  filename: string,
  sourcecode: string,
  moduleKind: ts.ModuleKind = ts.ModuleKind.ES2015,
  jsxEnabled = false,
  swcrcEnabled: boolean = Boolean(process.env.SWCRC),
): boolean {
  // Respect SWCRC workflows first. When users opt into external SWC config,
  // consistency with that config takes priority over local fast-path heuristics.
  if (swcrcEnabled) {
    return false
  }

  const extension = path.extname(filename).toLowerCase()
  if (!JS_RUNTIME_EXTENSIONS.has(extension)) {
    return false
  }

  // JSX in a .js file must be transformed; skipping would ship raw JSX to the
  // runtime and throw a SyntaxError. Never skip when JSX is configured or the
  // source looks like JSX. This guard runs before the module-kind branch so it
  // also protects ESM mode, which would otherwise skip every .js unconditionally.
  if (jsxEnabled || LOOKS_LIKE_JSX_REGEX.test(sourcecode)) {
    return false
  }

  // In non-CommonJS output modes, runtime JS files are already executable for
  // Node, so compiling them again mostly adds overhead.
  if (moduleKind !== ts.ModuleKind.CommonJS) {
    return true
  }

  // CommonJS mode is where accidental ESM-in-JS files usually break at runtime,
  // so we keep the transform path only when file content indicates that risk.
  return !LOOKS_LIKE_ESM_SYNTAX_REGEX.test(sourcecode)
}
