import { transform } from '@swc-node/core'
import { readDefaultTsConfig, tsCompilerOptionsToSwcConfig } from '@swc-node/register/read-default-tsconfig'
import { CompilerOptions, convertCompilerOptionsFromJson } from 'typescript'
import type { LoaderContext } from 'webpack'

export function loader(
  this: LoaderContext<{
    compilerOptions?: CompilerOptions
    configFile?: string
    fastRefresh?: boolean
  }>,
  source: string,
) {
  const callback = this.async()
  const { compilerOptions, configFile, fastRefresh } = this.getOptions() ?? {}
  const { options: assignedOptions } = convertCompilerOptionsFromJson(compilerOptions, '')
  const options =
    !assignedOptions || Object.keys(assignedOptions).length === 0 ? readDefaultTsConfig(configFile) : assignedOptions
  const swcOptions = tsCompilerOptionsToSwcConfig(options, this.resourcePath)
  if (fastRefresh) {
    if (swcOptions.react) {
      swcOptions.react.refresh = true
    } else {
      swcOptions.react = {
        refresh: true,
      }
    }
  }
  transform(source, this.resourcePath, swcOptions)
    .then(({ code, map }) => callback(null, code, map))
    .catch((err) => callback(err))
}
