import { existsSync } from 'fs'
import { join, parse } from 'path'

import chalk from 'chalk'
import debugFactory from 'debug'
import * as ts from 'typescript'

const debug = debugFactory('@swc-node')

export function readDefaultTsConfig() {
  const tsConfigPath =
    process.env.SWC_NODE_PROJECT ?? process.env.TS_NODE_PROJECT ?? join(process.cwd(), 'tsconfig.json')

  let compilerOptions: Partial<ts.CompilerOptions & { fallbackToTs: (path: string) => boolean }> = {
    target: ts.ScriptTarget.ES2018,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    sourceMap: true,
    esModuleInterop: true,
  }

  if (tsConfigPath && existsSync(tsConfigPath)) {
    try {
      debug(`Read config file from ${tsConfigPath}`)
      const { config } = ts.readConfigFile(tsConfigPath, ts.sys.readFile)

      const { options, errors, fileNames } = ts.parseJsonConfigFileContent(config, ts.sys, parse(tsConfigPath).dir)
      if (!errors.length) {
        compilerOptions = options
        compilerOptions.files = fileNames
      } else {
        console.info(
          chalk.yellow(`Convert compiler options from json failed, ${errors.map((d) => d.messageText).join('\n')}`),
        )
      }
    } catch (e) {
      console.info(chalk.yellow(`Read ${tsConfigPath} failed: ${e.message}`))
    }
  }
  return compilerOptions
}
