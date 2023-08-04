import { constants as FSConstants, promises as fs } from 'fs'
import { isAbsolute, join, parse } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

import ts from 'typescript'

// @ts-expect-error
import { readDefaultTsConfig } from '../lib/read-default-tsconfig.js'
// @ts-expect-error
import { compile } from '../lib/register.js'

type ResolveFn = (
  specifier: string,
  context?: { conditions: string[]; parentURL: string | undefined },
  defaultResolve?: ResolveFn,
) => Promise<{ url: string }>

const DEFAULT_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts']

const TRANSFORM_MAP = new Map<string, string>()

async function checkRequestURL(parentURL: string, requestURL: string) {
  const { dir, name, ext } = parse(requestURL)
  const parentDir = join(parentURL.startsWith('file://') ? fileURLToPath(parentURL) : parentURL, '..')
  if (ext && ext !== '.js' && ext !== '.mjs') {
    try {
      const url = join(parentDir, requestURL)
      await fs.access(url, FSConstants.R_OK)
      return url
    } catch (e) {
      // ignore
    }
  } else {
    for (const ext of DEFAULT_EXTENSIONS) {
      try {
        const url = join(parentDir, dir, `${name}${ext}`)
        await fs.access(url, FSConstants.R_OK)
        return url
      } catch (e) {
        // ignore
      }
      try {
        const url = join(parentDir, requestURL, `index${ext}`)
        await fs.access(url, FSConstants.R_OK)
        return url
      } catch (e) {
        // ignore
      }
    }
  }
}

export const resolve: ResolveFn = async (specifier, context, nextResolve) => {
  const rawUrl = TRANSFORM_MAP.get(specifier)
  if (rawUrl) {
    return { url: new URL(rawUrl).href, format: 'module', shortCircuit: true }
  }
  const { parentURL } = context ?? {}
  if (parentURL && TRANSFORM_MAP.has(parentURL) && specifier.startsWith('.')) {
    const existedURL = await checkRequestURL(parentURL, specifier)
    if (existedURL) {
      const { href: url } = pathToFileURL(existedURL)
      TRANSFORM_MAP.set(url, existedURL)
      return {
        url: new URL(url).href,
        shortCircuit: true,
        format: 'module',
      }
    }
  }
  if (DEFAULT_EXTENSIONS.some((ext) => specifier.endsWith(ext))) {
    specifier = specifier.startsWith('file://') ? specifier : pathToFileURL(specifier).toString()
    const newUrl = `${specifier}.mjs`
    TRANSFORM_MAP.set(newUrl, fileURLToPath(specifier))
    return {
      shortCircuit: true,
      url: new URL(newUrl).href,
      format: 'module',
    }
  }
  if (parentURL && isAbsolute(parentURL)) {
    return nextResolve!(specifier, {
      ...context!,
      parentURL: pathToFileURL(parentURL).toString(),
    })
  }
  return nextResolve!(specifier)
}

type LoadFn = (
  url: string,
  context: { format: string },
  defaultLoad: LoadFn,
) => Promise<{ format: string; source: string | ArrayBuffer | SharedArrayBuffer | Uint8Array }>

export const load: LoadFn = async (url, context, defaultLoad) => {
  const filePath = TRANSFORM_MAP.get(url)
  if (filePath) {
    const tsconfig: ts.CompilerOptions = readDefaultTsConfig()
    tsconfig.module = ts.ModuleKind.ESNext
    const code = await compile(await fs.readFile(filePath, 'utf8'), filePath, tsconfig, true)
    return {
      format: context.format,
      source: code,
      shortCircuit: true,
    }
  }
  return defaultLoad(url, context, defaultLoad)
}
