import { transform, Options } from '@swc-node/core'
import { readDefaultTsConfig, tsCompilerOptionsToSwcConfig } from '@swc-node/register/read-default-tsconfig'
import { CompilerOptions, convertCompilerOptionsFromJson } from 'typescript'
import type { LoaderContext } from 'webpack'

let swcConfig: Options

function getSwcConfig(
  this: LoaderContext<{
    compilerOptions?: CompilerOptions
    configFile?: string
    fastRefresh?: boolean
  }>,
): Options {
  if (!swcConfig) {
    const { compilerOptions, configFile, fastRefresh } = this.getOptions() ?? {}
    const { options: assignedOptions } = convertCompilerOptionsFromJson(compilerOptions, '')
    const options =
      !assignedOptions || Object.keys(assignedOptions).length === 0 ? readDefaultTsConfig(configFile) : assignedOptions
    swcConfig = tsCompilerOptionsToSwcConfig(options, this.resourcePath)
    if (fastRefresh) {
      if (swcConfig.react) {
        swcConfig.react.refresh = true
      } else {
        swcConfig.react = {
          refresh: true,
        }
      }
    }
  }

  return swcConfig
}

export function loader(
  this: LoaderContext<{
    compilerOptions?: CompilerOptions
    configFile?: string
    fastRefresh?: boolean
  }>,
  source: string,
) {
  const callback = this.async()
  transform(source, this.resourcePath, getSwcConfig.call(this))
    .then(({ code, map }) => callback(null, code, map))
    .catch((err) => callback(err))
}
