import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import debugFactory from 'debug'

const stableStringify = require('json-stable-stringify') as (value: unknown) => string

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
const CACHE_DIRECTORY =
  process.env.SWC_NODE_CACHE_DIR ?? join(tmpdir(), `swc-node-${process.getuid?.() ?? process.pid}`)
const CACHE_TTL_DAYS = Number(process.env.SWC_NODE_CACHE_TTL_DAYS ?? '7')
const MEMORY_CACHE_LIMIT = Number(process.env.SWC_NODE_CACHE_MEMORY_LIMIT ?? '2000')

if (!Number.isFinite(MEMORY_CACHE_LIMIT) || MEMORY_CACHE_LIMIT < 0) {
  throw new Error(`Invalid value for SWC_NODE_CACHE_MEMORY_LIMIT: ${process.env.SWC_NODE_CACHE_MEMORY_LIMIT}`)
}

const REGISTER_VERSION = readPackageVersion('../package.json')
const SWC_VERSION = readPackageVersion('@swc/core/package.json')

const memoryCache = new Map<string, TransformCacheEntry>()
let optionsSignatureCache = new WeakMap<Record<string, unknown>, string>()
let cacheDirectoryReady = false
let cleanupAttempted = false

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
  const signature = stableStringify(options)
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
    ensureCacheDirectory()
    const file = fs.readFileSync(join(CACHE_DIRECTORY, `${key}.json`), 'utf8')
    return JSON.parse(file) as TransformCacheEntry
  } catch (error) {
    debug('Failed to read cache file', error)
    return undefined
  }
}

function writeDiskCache(key: string, value: TransformCacheEntry) {
  try {
    ensureCacheDirectory()
    fs.writeFileSync(join(CACHE_DIRECTORY, `${key}.json`), JSON.stringify(value), 'utf8')
  } catch (error) {
    debug('Failed to write cache file', error)
  }
}

function ensureCacheDirectory() {
  if (!cacheDirectoryReady) {
    fs.mkdirSync(CACHE_DIRECTORY, { recursive: true })
    cacheDirectoryReady = true
  }

  if (!cleanupAttempted) {
    cleanupAttempted = true

    // Trigger cleanup only after cache is actually used, so startup work stays
    // minimal for short-lived commands.
    void cleanupStaleDiskCache()
  }
}

async function cleanupStaleDiskCache() {
  if (!Number.isFinite(CACHE_TTL_DAYS) || CACHE_TTL_DAYS <= 0) {
    return
  }

  try {
    const files = fs.readdirSync(CACHE_DIRECTORY)
    const now = Date.now()
    const maxAgeMs = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000

    // Age-based eviction keeps disk usage stable without maintaining additional metadata files.
    for (const file of files) {
      if (!file.endsWith('.json')) {
        // Non-cache files should not be touched, and may indicate a non-standard cache setup (e.g. with a symlink).
        return
      }

      const fullPath = join(CACHE_DIRECTORY, file)
      const ageMs = now - fs.statSync(fullPath).mtimeMs

      if (ageMs > maxAgeMs) {
        fs.unlinkSync(fullPath)
      }
    }
  } catch (error) {
    debug('Failed to cleanup cache directory', error)
  }
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
      fs.rmSync(CACHE_DIRECTORY, { recursive: true, force: true })
    } catch (error) {
      debug('Failed to clear cache directory', error)
    }

    cacheDirectoryReady = false
    cleanupAttempted = false
  }
}

export function getTransformCacheDirectory() {
  return CACHE_DIRECTORY
}
