# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.10.9](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.10.8...@swc-node/register@1.10.9) (2024-07-17)

### Bug Fixes

- **register:** skip load files in node_modules ([#828](https://github.com/swc-project/swc-node/issues/828)) ([f6816c1](https://github.com/swc-project/swc-node/commit/f6816c160191052454aae232ce75b9a8f8b3d9a5))

## [1.10.8](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.10.7...@swc-node/register@1.10.8) (2024-07-16)

### Bug Fixes

- **register:** bump oxc-resolver ([#824](https://github.com/swc-project/swc-node/issues/824)) ([2792552](https://github.com/swc-project/swc-node/commit/2792552302baa854c1efd8dc77b435fa86b84cf1))
- **register:** default TSCONFIG_PATH on windows. ([#818](https://github.com/swc-project/swc-node/issues/818)) ([92a3bbf](https://github.com/swc-project/swc-node/commit/92a3bbf329269a1d123ea4513541d3a6a418dd2d))
- **register:** remove file extension tests in compile ([#825](https://github.com/swc-project/swc-node/issues/825)) ([7c686f1](https://github.com/swc-project/swc-node/commit/7c686f13aa644bc280143f399ab60fc7fd8a9da3))

## [1.10.7](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.10.6...@swc-node/register@1.10.7) (2024-07-14)

**Note:** Version bump only for package @swc-node/register

## [1.10.6](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.10.5...@swc-node/register@1.10.6) (2024-07-13)

### Bug Fixes

- **register:** node18 compatible issues ([#814](https://github.com/swc-project/swc-node/issues/814)) ([6bbe5c2](https://github.com/swc-project/swc-node/commit/6bbe5c25f0348d9c8c47dc5c38d394784cf26214))

## [1.10.5](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.10.4...@swc-node/register@1.10.5) (2024-07-13)

### Bug Fixes

- **register:** allow running .tsx file ([#812](https://github.com/swc-project/swc-node/issues/812)) ([6a49076](https://github.com/swc-project/swc-node/commit/6a49076bd235ad95099887f1d89569ca89ac26bb))
- **register:** resolve .cjs/.cts file in esm package ([#813](https://github.com/swc-project/swc-node/issues/813)) ([154ee94](https://github.com/swc-project/swc-node/commit/154ee94224fd3c98e9e2fe22ad401c96e4dd2f5e))

## [1.10.4](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.10.3...@swc-node/register@1.10.4) (2024-07-12)

### Bug Fixes

- **register:** resolve internal cjs module ([#811](https://github.com/swc-project/swc-node/issues/811)) ([9aad5b0](https://github.com/swc-project/swc-node/commit/9aad5b0a86dbe58aed8cba9c57524ad8e553f21c))

## [1.10.3](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.10.2...@swc-node/register@1.10.3) (2024-07-08)

### Bug Fixes

- **register:** support moduleResolution Bundler ([#806](https://github.com/swc-project/swc-node/issues/806)) ([aab1e0f](https://github.com/swc-project/swc-node/commit/aab1e0f383f0ecd02d31916872f39de86d723467))

## [1.10.2](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.10.1...@swc-node/register@1.10.2) (2024-07-05)

### Bug Fixes

- **register:** resolve builtin modules without node: protocal ([#803](https://github.com/swc-project/swc-node/issues/803)) ([a4a6832](https://github.com/swc-project/swc-node/commit/a4a68320ef03385fab8d1f0b32203ad14c887590))

## [1.10.1](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.10.0...@swc-node/register@1.10.1) (2024-07-05)

### Bug Fixes

- **register:** do not send undefined source code for compilation ([#797](https://github.com/swc-project/swc-node/issues/797)) ([3499611](https://github.com/swc-project/swc-node/commit/3499611349c3bff2ab9d0eef7cb27b118f5305bf))
- **register:** ensure TS compiler option to SWC config transformer respects inline source map option ([#726](https://github.com/swc-project/swc-node/issues/726)) ([59f2d99](https://github.com/swc-project/swc-node/commit/59f2d99aa0f8d4ebe67d2b5b792e28c811b82420))
- **register:** file path with query ([#801](https://github.com/swc-project/swc-node/issues/801)) ([9e53df0](https://github.com/swc-project/swc-node/commit/9e53df0c40cc443820352098602a61f7a39e1330))
- **register:** tsx file ([#800](https://github.com/swc-project/swc-node/issues/800)) ([1071d8d](https://github.com/swc-project/swc-node/commit/1071d8d8f55e42822556ad0f16e14a7562242073))

# [1.10.0](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.9.2...@swc-node/register@1.10.0) (2024-06-28)

### Bug Fixes

- **esm-resolver:** only return early if the specifier is an unsupported file ([#789](https://github.com/swc-project/swc-node/issues/789)) ([014cf6a](https://github.com/swc-project/swc-node/commit/014cf6a1df0f58568bad296a3eac3f76c31abdde))

### Features

- try to resolve format for absolute path import ([86fb5d2](https://github.com/swc-project/swc-node/commit/86fb5d2f660c8dc1f8a73ba54fbc242aba628768))
- update esm module resolver ([92f05d4](https://github.com/swc-project/swc-node/commit/92f05d4a305e83446ee4ff6e66d3f42b474490e6))

## [1.9.2](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.9.1...@swc-node/register@1.9.2) (2024-06-08)

### Bug Fixes

- fix ts extension detect regex, close [#775](https://github.com/swc-project/swc-node/issues/775) [#774](https://github.com/swc-project/swc-node/issues/774) [#772](https://github.com/swc-project/swc-node/issues/772) ([#777](https://github.com/swc-project/swc-node/issues/777)) ([fd85848](https://github.com/swc-project/swc-node/commit/fd8584802b2d08ceef9fa0012ac7e47e30c8b130))

## [1.9.1](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.9.0...@swc-node/register@1.9.1) (2024-05-01)

### Bug Fixes

- **register:** fix esm entry resolver for third-party executer, close [#762](https://github.com/swc-project/swc-node/issues/762) ([#766](https://github.com/swc-project/swc-node/issues/766)) ([9e6c02f](https://github.com/swc-project/swc-node/commit/9e6c02feb9a19d9782981f984084885e92dae031))
- support compile js files. close [#761](https://github.com/swc-project/swc-node/issues/761) ([#767](https://github.com/swc-project/swc-node/issues/767)) ([016f1aa](https://github.com/swc-project/swc-node/commit/016f1aab2a17d2512d30b5a12848ed1941b59e49))

# [1.9.0](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.7.0...@swc-node/register@1.9.0) (2024-03-05)

### Bug Fixes

- add default tsconfig.baseUrl to align with tsc behavior ([#759](https://github.com/swc-project/swc-node/issues/759)) ([96139f7](https://github.com/swc-project/swc-node/commit/96139f70f2e2415477f14af03eb2bc45a472f33c))
- esm module resolve issues ([#754](https://github.com/swc-project/swc-node/issues/754)) ([d35ddf1](https://github.com/swc-project/swc-node/commit/d35ddf1a0f8b3fa1c498ec869ec4ce562b7fb3a4))
- import ts from node_modules ([#744](https://github.com/swc-project/swc-node/issues/744)) ([c4485ca](https://github.com/swc-project/swc-node/commit/c4485ca185cb31e36126e0da4e0b79a03acfc79b))

### Features

- upgrade dependencies ([#751](https://github.com/swc-project/swc-node/issues/751)) ([653bd13](https://github.com/swc-project/swc-node/commit/653bd13c4ac84bd4bd28b886dc0f4e77362d0734))

# [1.8.0](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.7.0...@swc-node/register@1.8.0) (2024-02-01)

### Bug Fixes

- import ts from node_modules ([#744](https://github.com/swc-project/swc-node/issues/744)) ([c4485ca](https://github.com/swc-project/swc-node/commit/c4485ca185cb31e36126e0da4e0b79a03acfc79b))

### Features

- upgrade dependencies ([#751](https://github.com/swc-project/swc-node/issues/751)) ([653bd13](https://github.com/swc-project/swc-node/commit/653bd13c4ac84bd4bd28b886dc0f4e77362d0734))

# [1.7.0](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.6.8...@swc-node/register@1.7.0) (2024-02-01)

### Bug Fixes

- **core:** respect useDefineForClassFields tsconfig value ([#740](https://github.com/swc-project/swc-node/issues/740)) ([9330c1a](https://github.com/swc-project/swc-node/commit/9330c1a1183723638b3c83cff63ec6f18a09294c))

### Features

- add esm-register for node>20.6 ([#748](https://github.com/swc-project/swc-node/issues/748)) ([23e511c](https://github.com/swc-project/swc-node/commit/23e511c47938d14a0c3d6fc542692469e6039433))
- **register:** add `SWC_NODE_IGNORE_DYNAMIC` env option ([0862975](https://github.com/swc-project/swc-node/commit/08629752249dc27e9f5b72a9af606dfd6fd7b48a))

## [1.6.8](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.6.7...@swc-node/register@1.6.8) (2023-09-26)

### Bug Fixes

- **register:** extension-aware module resolution and format handling ([e34f006](https://github.com/swc-project/swc-node/commit/e34f006484d89c53dd4cac7cface3c4d70841e34))

## [1.6.7](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.6.6...@swc-node/register@1.6.7) (2023-08-18)

### Bug Fixes

- **core:** Pass jsc.baseUrl ([#721](https://github.com/swc-project/swc-node/issues/721)) ([877bd58](https://github.com/swc-project/swc-node/commit/877bd58f44072d2f44f6164960271dc9e3fda873))
- fix import absolute path support ([ffecee5](https://github.com/swc-project/swc-node/commit/ffecee519075cd8311101e1e2327d7402cd3ba1f))

## [1.6.6](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.6.5...@swc-node/register@1.6.6) (2023-06-21)

### Bug Fixes

- tsCompilerOptionsToSwcConfig should not override default swc config for jest ([#714](https://github.com/swc-project/swc-node/issues/714)) ([60ea642](https://github.com/swc-project/swc-node/commit/60ea64284582ce3164ca3705976b4dc4215c2504))

## [1.6.5](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.6.4...@swc-node/register@1.6.5) (2023-04-24)

### Bug Fixes

- **register:** Fix to resolve adjacent file path ([#711](https://github.com/swc-project/swc-node/issues/711)) ([8dbea4f](https://github.com/swc-project/swc-node/commit/8dbea4fd0ac154cbc72088202a8ddf707e40fa13))
- **register:** inline sourcemap ([#708](https://github.com/swc-project/swc-node/issues/708)) ([07eec33](https://github.com/swc-project/swc-node/commit/07eec334de984c32eca8551e1d9a647075b6b035))

## [1.6.4](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.6.3...@swc-node/register@1.6.4) (2023-04-10)

### Bug Fixes

- **register:** make sourcemaps work with both error stack & debugger ([#707](https://github.com/swc-project/swc-node/issues/707)) ([334ada1](https://github.com/swc-project/swc-node/commit/334ada16617011f00b5cb6b240e7f62f08296761))
- **register:** url now returns the href of a url object ([#698](https://github.com/swc-project/swc-node/issues/698)) ([fd63aa1](https://github.com/swc-project/swc-node/commit/fd63aa1660140bc922fd810b51f27f756a719acb))

## [1.6.3](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.6.2...@swc-node/register@1.6.3) (2023-03-31)

### Bug Fixes

- **core,register:** ts Compiler to Swc Config: respects decorators config and SWCRC=true ([#702](https://github.com/swc-project/swc-node/issues/702)) ([d421ca8](https://github.com/swc-project/swc-node/commit/d421ca8aa02a07ea01b1f97e2f38d696d84e4531))

## [1.6.2](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.6.1...@swc-node/register@1.6.2) (2023-02-15)

### Bug Fixes

- **register:** enforece module option in register/esm ([#694](https://github.com/swc-project/swc-node/issues/694)) ([860d1f6](https://github.com/swc-project/swc-node/commit/860d1f6f5f7ece197e92a822470a093ae7a7a68a))

## [1.6.1](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.6.0...@swc-node/register@1.6.1) (2023-02-11)

### Bug Fixes

- **register:** include esm files ([8d6b0b7](https://github.com/swc-project/swc-node/commit/8d6b0b77d5ec725ff75989455f8163d88c306878))

# [1.6.0](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.5.8...@swc-node/register@1.6.0) (2023-02-10)

### Features

- **register:** experimental esm loader ([#643](https://github.com/swc-project/swc-node/issues/643)) ([0b4d305](https://github.com/swc-project/swc-node/commit/0b4d30505408f6f07c1ff8ea5c1953e1d22bb4e1))

## [1.5.8](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.5.7...@swc-node/register@1.5.8) (2023-02-10)

### Bug Fixes

- **register:** paths option ([c51be25](https://github.com/swc-project/swc-node/commit/c51be25d28da06d29620caee2505bff609cba445))

## [1.5.7](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.5.6...@swc-node/register@1.5.7) (2023-02-07)

### Bug Fixes

- **register:** align externalHelpers with tsconfig.importHelpers ([2f3e155](https://github.com/swc-project/swc-node/commit/2f3e155b400605130ada4ef7dc6cfa5dfedd0c0c))

## [1.5.6](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.5.5...@swc-node/register@1.5.6) (2023-02-07)

### Bug Fixes

- **register:** always inline swc helpers ([1d557ec](https://github.com/swc-project/swc-node/commit/1d557ece0d9ccbba027ff9f2d262c03d4b918bcb))
- **register:** react configuration ([af643b8](https://github.com/swc-project/swc-node/commit/af643b849c32abb58bd1c0fdf98eeeac08548e25))

## [1.5.5](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.5.4...@swc-node/register@1.5.5) (2023-01-05)

**Note:** Version bump only for package @swc-node/register

## [1.5.4](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.5.3...@swc-node/register@1.5.4) (2022-10-06)

### Bug Fixes

- **register:** @swc/core should be in peerDependencies ([cb05cae](https://github.com/swc-project/swc-node/commit/cb05cae69dd92d13593c210f8c0044b6aff8ff1c))

## [1.5.3](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.5.2...@swc-node/register@1.5.3) (2022-10-06)

**Note:** Version bump only for package @swc-node/register

## [1.5.2](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.5.1...@swc-node/register@1.5.2) (2022-09-22)

### Bug Fixes

- **register:** support paths alias with baseUrl ([2a6848a](https://github.com/swc-project/swc-node/commit/2a6848a00b8931f41b62f6b5a519bdbc548bfec3))

## [1.5.1](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.5.0...@swc-node/register@1.5.1) (2022-04-28)

### Bug Fixes

- **register:** move typescript to devDependencies ([c0011ca](https://github.com/swc-project/swc-node/commit/c0011ca0eb535f7eacf184ec116c775121c64905))

# [1.5.0](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.4.2...@swc-node/register@1.5.0) (2022-04-27)

### Features

- **jest:** read tsconfig for default jest transform options ([8c180e6](https://github.com/swc-project/swc-node/commit/8c180e68abbc66aa68f83b401d985a6c8617baa9))
- **register:** always resolve full file path for tsconfig and add paths if available ([#646](https://github.com/swc-project/swc-node/issues/646)) ([3062413](https://github.com/swc-project/swc-node/commit/3062413e464a5b5706c5ac4912f43ef7451fe73b))
- **register:** return addHook result to it can be reverted ([222e205](https://github.com/swc-project/swc-node/commit/222e2056351e3a2ba2a4764537c9410b0112051e)), closes [/github.com/facebook/jest/blob/199f9811ae68b15879cbe18b7ef7ebd61eefcf23/packages/jest-config/src/readConfigFileAndSetRootDir.ts#L83-101](https://github.com//github.com/facebook/jest/blob/199f9811ae68b15879cbe18b7ef7ebd61eefcf23/packages/jest-config/src/readConfigFileAndSetRootDir.ts/issues/L83-101)
- **register:** support hook options ([4c6dad7](https://github.com/swc-project/swc-node/commit/4c6dad7bfbf4563c44bd25476a6ab5d78cff55dc))

## [1.4.2](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.4.1...@swc-node/register@1.4.2) (2021-12-15)

**Note:** Version bump only for package @swc-node/register

## [1.4.1](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.4.0...@swc-node/register@1.4.1) (2021-12-13)

**Note:** Version bump only for package @swc-node/register

# [1.4.0](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.3.8...@swc-node/register@1.4.0) (2021-11-08)

### Features

- **register:** support tsconfig in subdirectory ([634d766](https://github.com/swc-project/swc-node/commit/634d766aa22013ec725c0d30317eb38963410db3))

## [1.3.8](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.3.7...@swc-node/register@1.3.8) (2021-11-08)

**Note:** Version bump only for package @swc-node/register

## [1.3.7](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.3.6...@swc-node/register@1.3.7) (2021-10-29)

**Note:** Version bump only for package @swc-node/register

## [1.3.6](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.3.5...@swc-node/register@1.3.6) (2021-10-16)

### Bug Fixes

- **register:** basePath arg to ts should be cwd ([e5d4c31](https://github.com/swc-project/swc-node/commit/e5d4c3118b73bb38d4710daa84befff0e16d8d81))

## [1.3.5](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.3.4...@swc-node/register@1.3.5) (2021-09-11)

**Note:** Version bump only for package @swc-node/register

## [1.3.4](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.3.3...@swc-node/register@1.3.4) (2021-08-16)

### Bug Fixes

- **register:** outdated ts->swc config ([cff217b](https://github.com/swc-project/swc-node/commit/cff217b9b45199c580e9ed308f3826b577776bb3))

## [1.3.3](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.3.2...@swc-node/register@1.3.3) (2021-08-01)

### Bug Fixes

- **register:** make typescript a dependency ([#563](https://github.com/swc-project/swc-node/issues/563)) ([9152f74](https://github.com/swc-project/swc-node/commit/9152f74c8494a603315a0bcfd6f05e9a691879d2))

## [1.3.2](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.3.1...@swc-node/register@1.3.2) (2021-06-07)

### Bug Fixes

- **register:** always enable dynamicImport ([0eb1bf2](https://github.com/swc-project/swc-node/commit/0eb1bf2e0bce97ca70d72dc13c51c8eac221029d))

## [1.3.1](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.3.0...@swc-node/register@1.3.1) (2021-05-23)

### Bug Fixes

- **register:** exports field in package.json ([bd0459d](https://github.com/swc-project/swc-node/commit/bd0459da56930bf0334bcb5cc5059edfec9fa99c))

# [1.3.0](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.2.1...@swc-node/register@1.3.0) (2021-05-21)

### Features

- **loader:** implement tsconfig compatible loader ([8c1cd85](https://github.com/swc-project/swc-node/commit/8c1cd858a64a6b6ec6ff23811bafab7dfe30554d))

## [1.2.1](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.2.0...@swc-node/register@1.2.1) (2021-04-29)

### Bug Fixes

- **register:** 'both' value is not valid sourcemaps config ([38207d5](https://github.com/swc-project/swc-node/commit/38207d52fd55c0157319370e3857d5372cb697ba))

# [1.2.0](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.1.0...@swc-node/register@1.2.0) (2021-04-28)

### Features

- **core:** expose inline and both config for sourcemap ([780f2bb](https://github.com/swc-project/swc-node/commit/780f2bb81053af6fc6af865a979059ffff470eac))

# [1.1.0](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.0.5...@swc-node/register@1.1.0) (2021-04-21)

### Features

- **register:** use keepClassNames: true by default ([5936616](https://github.com/swc-project/swc-node/commit/59366169c700544bf287b7a68e883efaaad6806b))

## [1.0.5](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.0.4...@swc-node/register@1.0.5) (2021-03-04)

**Note:** Version bump only for package @swc-node/register

## [1.0.4](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.0.3...@swc-node/register@1.0.4) (2021-01-25)

### Bug Fixes

- adhere to ReactConfig type ([8d44f6a](https://github.com/swc-project/swc-node/commit/8d44f6ad067a833dfc461f5eb8a2c5491d968810))
- support custom jsx pragma ([3b98312](https://github.com/swc-project/swc-node/commit/3b983121fecd666eef0ae6ff8c4f1df19563fca8))

## [1.0.3](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.0.2...@swc-node/register@1.0.3) (2021-01-04)

**Note:** Version bump only for package @swc-node/register

## [1.0.2](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.0.1...@swc-node/register@1.0.2) (2020-11-18)

### Bug Fixes

- **register:** handle absolute file paths ([f21a48a](https://github.com/swc-project/swc-node/commit/f21a48a5a3150ce388a695bf8e36d5d8a64895db))

## [1.0.1](https://github.com/swc-project/swc-node/compare/@swc-node/register@1.0.0...@swc-node/register@1.0.1) (2020-10-21)

**Note:** Version bump only for package @swc-node/register

## [0.5.3](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.5.2...@swc-node/register@0.5.3) (2020-09-18)

### Bug Fixes

- **register:** integrate tests ([b012869](https://github.com/swc-project/swc-node/commit/b0128698e7274d37856e2593849d58f67e9e302b))

## [0.5.2](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.5.1...@swc-node/register@0.5.2) (2020-09-18)

### Bug Fixes

- **register:** remove .d.ts from extensions ([62b6a69](https://github.com/swc-project/swc-node/commit/62b6a69704d9a2f908489728bfbd41b24672612e))

## [0.5.1](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.5.0...@swc-node/register@0.5.1) (2020-09-17)

### Bug Fixes

- **register:** add fastpath to handle .d.ts file ([afe4ca9](https://github.com/swc-project/swc-node/commit/afe4ca921985ecce907cb752fb674c8278041bc0))

# [0.5.0](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.4.10...@swc-node/register@0.5.0) (2020-09-16)

### Features

- **register:** support read include/exclude config from tsconfig ([0dec2cd](https://github.com/swc-project/swc-node/commit/0dec2cdcf002c361abef068cf227a8bfe6cdea2a))

## [0.4.11](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.4.10...@swc-node/register@0.4.11) (2020-09-13)

**Note:** Version bump only for package @swc-node/register

## [0.4.10](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.4.9...@swc-node/register@0.4.10) (2020-09-11)

### Bug Fixes

- **core:** add support for esModuleInterop ([a7f3331](https://github.com/swc-project/swc-node/commit/a7f3331f06d597e39cb44be8a8d73f264a417a71))

## [0.4.9](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.4.8...@swc-node/register@0.4.9) (2020-09-09)

**Note:** Version bump only for package @swc-node/register

## [0.4.8](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.4.7...@swc-node/register@0.4.8) (2020-09-07)

**Note:** Version bump only for package @swc-node/register

## [0.4.7](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.4.6...@swc-node/register@0.4.7) (2020-09-06)

**Note:** Version bump only for package @swc-node/register

## [0.4.6](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.4.5...@swc-node/register@0.4.6) (2020-09-04)

**Note:** Version bump only for package @swc-node/register

## [0.4.5](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.4.4...@swc-node/register@0.4.5) (2020-09-01)

**Note:** Version bump only for package @swc-node/register

## [0.4.4](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.4.2...@swc-node/register@0.4.4) (2020-08-31)

**Note:** Version bump only for package @swc-node/register

## [0.4.3](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.4.2...@swc-node/register@0.4.3) (2020-08-28)

**Note:** Version bump only for package @swc-node/register

## [0.4.2](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.4.1...@swc-node/register@0.4.2) (2020-08-24)

**Note:** Version bump only for package @swc-node/register

## [0.4.1](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.4.0...@swc-node/register@0.4.1) (2020-08-23)

### Bug Fixes

- **register:** should not install sourcemap if sourcemap is undefined ([517f927](https://github.com/swc-project/swc-node/commit/517f927d20f79c8bbcd81bb6d445c52b0602f203))

# [0.4.0](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.3.4...@swc-node/register@0.4.0) (2020-08-23)

### Bug Fixes

- **register:** missing register.js file in package.json ([366d370](https://github.com/swc-project/swc-node/commit/366d3706af778e47f0427f92fe1a171cd43e2a62))

### BREAKING CHANGES

- **register:** missing files

## [0.3.4](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.3.3...@swc-node/register@0.3.4) (2020-08-23)

**Note:** Version bump only for package @swc-node/register

## [0.3.3](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.3.2...@swc-node/register@0.3.3) (2020-08-21)

**Note:** Version bump only for package @swc-node/register

## [0.3.2](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.3.1...@swc-node/register@0.3.2) (2020-08-20)

**Note:** Version bump only for package @swc-node/register

## [0.3.1](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.3.0...@swc-node/register@0.3.1) (2020-08-20)

**Note:** Version bump only for package @swc-node/register

## [0.3.0](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.2.6...@swc-node/register@0.3.0) (2020-08-20)

### BREAKING CHANGE

- **register:** respect tsconfig.json in SWC_NODE_PROJECT

## [0.2.6](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.2.5...@swc-node/register@0.2.6) (2020-08-18)

**Note:** Version bump only for package @swc-node/register

## [0.2.5](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.2.4...@swc-node/register@0.2.5) (2020-08-14)

**Note:** Version bump only for package @swc-node/register

## [0.2.4](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.2.3...@swc-node/register@0.2.4) (2020-08-13)

**Note:** Version bump only for package @swc-node/register

## [0.2.3](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.2.2...@swc-node/register@0.2.3) (2020-08-10)

**Note:** Version bump only for package @swc-node/register

## [0.2.2](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.2.1...@swc-node/register@0.2.2) (2020-08-10)

**Note:** Version bump only for package @swc-node/register

## [0.2.1](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.2.0...@swc-node/register@0.2.1) (2020-08-09)

**Note:** Version bump only for package @swc-node/register

# [0.2.0](https://github.com/swc-project/swc-node/compare/@swc-node/register@0.1.12...@swc-node/register@0.2.0) (2020-08-09)

### Features

- **core:** add support for emitDecoratorMetadata ([edd2fd5](https://github.com/swc-project/swc-node/commit/edd2fd575bf43bf4206a49b5b078945de5eae95a))
