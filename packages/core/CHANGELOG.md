# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.13.3](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.13.2...@swc-node/core@1.13.3) (2024-07-14)

### Bug Fixes

- **register:** enable keepImportAttributes in SWC options ([#816](https://github.com/swc-project/swc-node/issues/816)) ([33568ee](https://github.com/swc-project/swc-node/commit/33568ee42dfb580b4b739ecf89ba7ebb85c45330))
- **register:** resolve internal cjs module ([#811](https://github.com/swc-project/swc-node/issues/811)) ([9aad5b0](https://github.com/swc-project/swc-node/commit/9aad5b0a86dbe58aed8cba9c57524ad8e553f21c))

## [1.13.2](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.13.1...@swc-node/core@1.13.2) (2024-07-05)

**Note:** Version bump only for package @swc-node/core

## [1.13.1](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.13.0...@swc-node/core@1.13.1) (2024-05-01)

### Bug Fixes

- support compile js files. close [#761](https://github.com/swc-project/swc-node/issues/761) ([#767](https://github.com/swc-project/swc-node/issues/767)) ([016f1aa](https://github.com/swc-project/swc-node/commit/016f1aab2a17d2512d30b5a12848ed1941b59e49))

# [1.13.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.11.0...@swc-node/core@1.13.0) (2024-03-05)

### Features

- upgrade dependencies ([#751](https://github.com/swc-project/swc-node/issues/751)) ([653bd13](https://github.com/swc-project/swc-node/commit/653bd13c4ac84bd4bd28b886dc0f4e77362d0734))

# [1.12.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.11.0...@swc-node/core@1.12.0) (2024-02-01)

### Features

- upgrade dependencies ([#751](https://github.com/swc-project/swc-node/issues/751)) ([653bd13](https://github.com/swc-project/swc-node/commit/653bd13c4ac84bd4bd28b886dc0f4e77362d0734))

# [1.11.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.10.6...@swc-node/core@1.11.0) (2024-02-01)

### Bug Fixes

- **core:** respect useDefineForClassFields tsconfig value ([#740](https://github.com/swc-project/swc-node/issues/740)) ([9330c1a](https://github.com/swc-project/swc-node/commit/9330c1a1183723638b3c83cff63ec6f18a09294c))
- respect sourceMaps swcrc value ([#742](https://github.com/swc-project/swc-node/issues/742)) ([df125c8](https://github.com/swc-project/swc-node/commit/df125c8335c25a4dd75c56f5210f822541707d93))

### Features

- **core:** add `ignoreDynamic` option ([4d32c17](https://github.com/swc-project/swc-node/commit/4d32c1700bb2bdb5c56afd26539598b0968dda84))

## [1.10.6](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.10.5...@swc-node/core@1.10.6) (2023-09-26)

**Note:** Version bump only for package @swc-node/core

## [1.10.5](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.10.4...@swc-node/core@1.10.5) (2023-08-18)

### Bug Fixes

- **core:** assign `baseUrl` property ([55c7b20](https://github.com/swc-project/swc-node/commit/55c7b204ddeb1ad2bfc701918ed76f5374414ebe))
- **core:** Pass jsc.baseUrl ([#721](https://github.com/swc-project/swc-node/issues/721)) ([877bd58](https://github.com/swc-project/swc-node/commit/877bd58f44072d2f44f6164960271dc9e3fda873))

## [1.10.4](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.10.3...@swc-node/core@1.10.4) (2023-06-21)

### Bug Fixes

- tsCompilerOptionsToSwcConfig should not override default swc config for jest ([#714](https://github.com/swc-project/swc-node/issues/714)) ([60ea642](https://github.com/swc-project/swc-node/commit/60ea64284582ce3164ca3705976b4dc4215c2504))

## [1.10.3](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.10.2...@swc-node/core@1.10.3) (2023-04-10)

**Note:** Version bump only for package @swc-node/core

## [1.10.2](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.10.1...@swc-node/core@1.10.2) (2023-03-31)

### Bug Fixes

- **core,register:** ts Compiler to Swc Config: respects decorators config and SWCRC=true ([#702](https://github.com/swc-project/swc-node/issues/702)) ([d421ca8](https://github.com/swc-project/swc-node/commit/d421ca8aa02a07ea01b1f97e2f38d696d84e4531))

## [1.10.1](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.10.0...@swc-node/core@1.10.1) (2023-02-15)

### Bug Fixes

- **core:** enforce sourcemap: 'inline' for jest ([#695](https://github.com/swc-project/swc-node/issues/695)) ([2439b7e](https://github.com/swc-project/swc-node/commit/2439b7e2cd28fee7d0d1038b91baeb042a32c146))

# [1.10.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.9.2...@swc-node/core@1.10.0) (2023-02-10)

### Features

- **register:** experimental esm loader ([#643](https://github.com/swc-project/swc-node/issues/643)) ([0b4d305](https://github.com/swc-project/swc-node/commit/0b4d30505408f6f07c1ff8ea5c1953e1d22bb4e1))

## [1.9.2](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.9.1...@swc-node/core@1.9.2) (2023-01-05)

### Bug Fixes

- **jest:** add externalHelpers:true for jest ([#673](https://github.com/swc-project/swc-node/issues/673)) ([e353c1a](https://github.com/swc-project/swc-node/commit/e353c1a4843671fc7a8f5ccc5727ab260e060565))

## [1.9.1](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.9.0...@swc-node/core@1.9.1) (2022-09-22)

### Bug Fixes

- **core:** move @swc/core to peerDependencies ([821542b](https://github.com/swc-project/swc-node/commit/821542bb254c7f840443bc45f0505fa478983496))

# [1.9.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.8.2...@swc-node/core@1.9.0) (2022-04-27)

### Features

- **jest:** read tsconfig for default jest transform options ([8c180e6](https://github.com/swc-project/swc-node/commit/8c180e68abbc66aa68f83b401d985a6c8617baa9))

## [1.8.2](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.8.1...@swc-node/core@1.8.2) (2021-12-15)

**Note:** Version bump only for package @swc-node/core

## [1.8.1](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.8.0...@swc-node/core@1.8.1) (2021-12-13)

**Note:** Version bump only for package @swc-node/core

# [1.8.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.7.1...@swc-node/core@1.8.0) (2021-11-08)

### Features

- **core:** enable inlineSourcesContent by default ([c2d1d3f](https://github.com/swc-project/swc-node/commit/c2d1d3f34e4f3c9b5f974c641075877e02e28ebb))

## [1.7.1](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.7.0...@swc-node/core@1.7.1) (2021-10-29)

**Note:** Version bump only for package @swc-node/core

# [1.7.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.6.0...@swc-node/core@1.7.0) (2021-10-16)

### Features

- **core:** add swc option to pass raw SwcOptions ([dbee70c](https://github.com/swc-project/swc-node/commit/dbee70c4157ee6c03fe3f2ae7a834195487dfe38))

# [1.6.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.5.1...@swc-node/core@1.6.0) (2021-09-11)

### Bug Fixes

- typecheck ([d39561d](https://github.com/swc-project/swc-node/commit/d39561d3215b5ce2c81f59f51045a1ac7535fe18))
- **register:** outdated ts->swc config ([cff217b](https://github.com/swc-project/swc-node/commit/cff217b9b45199c580e9ed308f3826b577776bb3))

### Features

- add typescript path support ([54615b8](https://github.com/swc-project/swc-node/commit/54615b880d70bc41c547cd13cacc2ebefd0bd82c))

## [1.5.1](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.5.0...@swc-node/core@1.5.1) (2021-06-07)

### Bug Fixes

- **register:** always enable dynamicImport ([0eb1bf2](https://github.com/swc-project/swc-node/commit/0eb1bf2e0bce97ca70d72dc13c51c8eac221029d))

# [1.5.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.4.0...@swc-node/core@1.5.0) (2021-05-21)

### Features

- **loader:** implement tsconfig compatible loader ([8c1cd85](https://github.com/swc-project/swc-node/commit/8c1cd858a64a6b6ec6ff23811bafab7dfe30554d))

# [1.4.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.3.0...@swc-node/core@1.4.0) (2021-04-28)

### Features

- **core:** expose inline and both config for sourcemap ([780f2bb](https://github.com/swc-project/swc-node/commit/780f2bb81053af6fc6af865a979059ffff470eac))

# [1.3.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.2.0...@swc-node/core@1.3.0) (2021-03-04)

### Features

- **core:** support keepClassNames in Config ([fcbadd5](https://github.com/swc-project/swc-node/commit/fcbadd59d1752e26f1838d29ba98c2b525dda110))

# [1.2.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.1.2...@swc-node/core@1.2.0) (2021-01-25)

### Features

- **jest:** cache transpile result to avoid source code to be compiled mult times ([77cc3d8](https://github.com/swc-project/swc-node/commit/77cc3d8ea82728b9b486e1b5fd898f82180c3f37))

## [1.1.2](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.1.1...@swc-node/core@1.1.2) (2021-01-04)

**Note:** Version bump only for package @swc-node/core

## [1.1.1](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.1.0...@swc-node/core@1.1.1) (2020-11-18)

**Note:** Version bump only for package @swc-node/core

# [1.1.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@1.0.0...@swc-node/core@1.1.0) (2020-10-21)

### Features

- **core:** support react config in transformOptions ([313e021](https://github.com/swc-project/swc-node/commit/313e02128f833b09f4bf6dd9200b82819cb734cc))

## [0.7.6](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.7.4...@swc-node/core@0.7.6) (2020-09-16)

### Bug Fixes

- **core:** cjs import order and resolver issues ([b61e241](https://github.com/swc-project/swc-node/commit/b61e241613b376d77278ac087f768c72f84ac807))

## [0.7.5](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.7.4...@swc-node/core@0.7.5) (2020-09-13)

### Bug Fixes

- **core:** cjs import order and resolver issues ([deca648](https://github.com/swc-project/swc-node/commit/deca64873c897bddffae4a3c3186966626d274c4))

## [0.7.4](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.7.3...@swc-node/core@0.7.4) (2020-09-11)

### Bug Fixes

- **core:** add support for esModuleInterop ([a7f3331](https://github.com/swc-project/swc-node/commit/a7f3331f06d597e39cb44be8a8d73f264a417a71))

## [0.7.3](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.7.2...@swc-node/core@0.7.3) (2020-09-09)

### Bug Fixes

- **core:** conditional expr in callee & do not rename new keywords in meta properties ([c893622](https://github.com/swc-project/swc-node/commit/c8936229782164fe54bd864ecc2d8049827fd1ef))

## [0.7.2](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.7.1...@swc-node/core@0.7.2) (2020-09-07)

### Bug Fixes

- **core:** wrong assertion in hygiene ([b28cc10](https://github.com/swc-project/swc-node/commit/b28cc10875a0c98db78f402dfa5d3762ec77cd31))

## [0.7.1](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.7.0...@swc-node/core@0.7.1) (2020-09-06)

### Bug Fixes

- **core:** wrong this in function call expr in optional chains ([5d9966f](https://github.com/swc-project/swc-node/commit/5d9966f9eb4b1026356a3f824568f9804faa05ff))

# [0.7.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.6.1...@swc-node/core@0.7.0) (2020-09-04)

### Features

- **core:** upgrade to napi@0.5 ([bf5f2c4](https://github.com/swc-project/swc-node/commit/bf5f2c4b9efc074e0b1ff62f8d7ee2b1c578228f))

## [0.6.1](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.6.0...@swc-node/core@0.6.1) (2020-09-01)

### Bug Fixes

- **core:** macOS 10.13 compatible issue ([c5917ac](https://github.com/swc-project/swc-node/commit/c5917ac54678757afeca1600ff2a9c459190dfd1))

# [0.6.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.4.2...@swc-node/core@0.6.0) (2020-08-31)

### Features

- **core:** provide jest hoist plugin ([f3638f2](https://github.com/swc-project/swc-node/commit/f3638f2004b9fb323261a301b6fe354255846965))

# [0.5.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.4.2...@swc-node/core@0.5.0) (2020-08-28)

### Features

- **core:** provide jest hoist plugin ([f3638f2](https://github.com/swc-project/swc-node/commit/f3638f2004b9fb323261a301b6fe354255846965))

## [0.4.2](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.4.1...@swc-node/core@0.4.2) (2020-08-24)

### Bug Fixes

- **core:** linux musl addon loader ([c6e8a78](https://github.com/swc-project/swc-node/commit/c6e8a7858f504eaabf07254cf7e3ec42eee432eb))

## [0.4.1](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.4.0...@swc-node/core@0.4.1) (2020-08-23)

### Bug Fixes

- wrong benchmark setup ([7bd298d](https://github.com/swc-project/swc-node/commit/7bd298d1d4cf3dddf770caa75671e681066e5b83))

# [0.4.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.3.0...@swc-node/core@0.4.0) (2020-08-23)

### Bug Fixes

- **core:** version.js ([f8ba87d](https://github.com/swc-project/swc-node/commit/f8ba87d13bb9768c1725512fba5168027a3319ac))

### Features

- **core:** support linux musl ([9e1bac7](https://github.com/swc-project/swc-node/commit/9e1bac7a55d4c6dd9f99eaaf1acbade16339c8fe))

# [0.3.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.2.9...@swc-node/core@0.3.0) (2020-08-21)

### Features

- **core:** TypeScript 4.0 ([c18ab85](https://github.com/swc-project/swc-node/commit/c18ab85f6911ca44e6db70894ee21a0653695411))

## [0.2.9](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.2.8...@swc-node/core@0.2.9) (2020-08-20)

### Bug Fixes

- **core:** transform api ([11f2601](https://github.com/swc-project/swc-node/commit/11f26018a0860afcf33b7e86dcc44975096489e4))

## [0.2.8](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.2.7...@swc-node/core@0.2.8) (2020-08-20)

**Note:** Version bump only for package @swc-node/core

## [0.2.7](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.2.6...@swc-node/core@0.2.7) (2020-08-20)

### Features

- **core:** add filename to error message if compile failed ([dddf0ac](https://github.com/swc-project/swc-node/commit/dddf0acac53723db382d79a82cb6153b5dd10dd6))

## [0.2.6](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.2.5...@swc-node/core@0.2.6) (2020-08-18)

### Performance Improvements

- **core:** around ~25 performance gain ([4d6fc06](https://github.com/swc-project/swc-node/commit/4d6fc0687e2890dcfdbd0fe33c3d45c1d743876f))

## [0.2.5](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.2.4...@swc-node/core@0.2.5) (2020-08-14)

### Bug Fixes

- **core:** Allow referencing global idents even when it's injected ([dcf44e5](https://github.com/swc-project/swc-node/commit/dcf44e5631cfaed68310e2447882ff3aa88b652a))

## [0.2.4](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.2.3...@swc-node/core@0.2.4) (2020-08-13)

### Bug Fixes

- **core:** bugfix from upstream ([2bcb946](https://github.com/swc-project/swc-node/commit/2bcb9461d7d3c2dba9944f1c3bc746dc5c375ca3))

## [0.2.3](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.2.2...@swc-node/core@0.2.3) (2020-08-10)

### Bug Fixes

- **core:** strip TypeScript class properties without value assigned ([88f7022](https://github.com/swc-project/swc-node/commit/88f7022bb555cc2063c4f95743a88633a6aadb46))

## [0.2.2](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.2.1...@swc-node/core@0.2.2) (2020-08-10)

### Bug Fixes

- **core:** class properties transform ([de3d564](https://github.com/swc-project/swc-node/commit/de3d5647c48202ceb12cd90cd59311d8bc1607f4))

## [0.2.1](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.2.0...@swc-node/core@0.2.1) (2020-08-09)

### Bug Fixes

- **core:** missing jsx option ([0518375](https://github.com/swc-project/swc-node/commit/0518375485974258461910b78e73b49ef5b4f67b))

# [0.2.0](https://github.com/swc-project/swc-node/compare/@swc-node/core@0.1.12...@swc-node/core@0.2.0) (2020-08-09)

### Features

- **core:** add support for emitDecoratorMetadata ([edd2fd5](https://github.com/swc-project/swc-node/commit/edd2fd575bf43bf4206a49b5b078945de5eae95a))
