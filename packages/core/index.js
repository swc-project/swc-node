import { transform as swcTransform, transformSync as swcTransformSync } from '@swc/core'
// Oldest LTS Node.js supported target
const DEFAULT_ES_TARGET = 'es2018'
function transformOption(path, options, jest = false) {
  var _a, _b, _c, _d, _e, _f
  const opts = options !== null && options !== void 0 ? options : {}
  opts.esModuleInterop = (_a = opts.esModuleInterop) !== null && _a !== void 0 ? _a : true
  const moduleType =
    (_b = options === null || options === void 0 ? void 0 : options.module) !== null && _b !== void 0 ? _b : 'commonjs'
  return {
    filename: path,
    jsc: (
      (_c = options === null || options === void 0 ? void 0 : options.swc) === null || _c === void 0 ? void 0 : _c.swcrc
    )
      ? undefined
      : {
          target: (_d = opts.target) !== null && _d !== void 0 ? _d : DEFAULT_ES_TARGET,
          externalHelpers: jest ? true : Boolean(opts.externalHelpers),
          parser: {
            syntax: 'typescript',
            tsx: typeof opts.jsx !== 'undefined' ? opts.jsx : path.endsWith('.tsx'),
            decorators: Boolean(opts.experimentalDecorators),
            dynamicImport: Boolean(opts.dynamicImport),
          },
          transform: {
            legacyDecorator: Boolean(opts.experimentalDecorators),
            decoratorMetadata: Boolean(opts.emitDecoratorMetadata),
            useDefineForClassFields: Boolean(opts.useDefineForClassFields),
            react: options === null || options === void 0 ? void 0 : options.react,
            // @ts-expect-error
            hidden: {
              jest,
            },
          },
          keepClassNames: opts.keepClassNames,
          paths: opts.paths,
          baseUrl: opts.baseUrl,
        },
    minify: false,
    isModule: true,
    module: (
      (_e = options === null || options === void 0 ? void 0 : options.swc) === null || _e === void 0 ? void 0 : _e.swcrc
    )
      ? undefined
      : {
          type: moduleType,
          ...(moduleType === 'commonjs' || moduleType === 'umd' || moduleType === 'amd'
            ? {
                noInterop: !opts.esModuleInterop,
                ignoreDynamic: opts.ignoreDynamic,
              }
            : undefined),
        },
    sourceMaps: (
      (_f = options === null || options === void 0 ? void 0 : options.swc) === null || _f === void 0 ? void 0 : _f.swcrc
    )
      ? undefined
      : jest || typeof opts.sourcemap === 'undefined'
        ? 'inline'
        : opts.sourcemap,
    inlineSourcesContent: true,
    swcrc: false,
    ...(options === null || options === void 0 ? void 0 : options.swc),
  }
}
export function transformSync(source, path, options) {
  return swcTransformSync(source, transformOption(path, options))
}
export function transformJest(source, path, options) {
  return swcTransformSync(source, transformOption(path, options, true))
}
export function transform(source, path, options) {
  return swcTransform(source, transformOption(path, options))
}
//# sourceMappingURL=index.js.map
