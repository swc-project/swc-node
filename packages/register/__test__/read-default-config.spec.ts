import { join, dirname } from 'path'

import test from 'ava'
import { omit } from 'lodash'
import sinon from 'sinon'
import * as ts from 'typescript'

import { readDefaultTsConfig } from '../read-default-tsconfig'

test('should read tsconfig from cwd if without any config', (t) => {
  delete process.env.SWC_NODE_PROJECT
  const defaultOptions = readDefaultTsConfig()
  const { config } = ts.readConfigFile(join(process.cwd(), 'tsconfig.json'), ts.sys.readFile)
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, process.cwd())
  t.deepEqual(omit(defaultOptions, 'files'), options)
})

test('should RESPECT SWC_NODE_PROJECT env', (t) => {
  const configPath = join(__dirname, 'tsconfig.spec.json')
  delete process.env.SWC_NODE_PROJECT
  delete process.env.TS_NODE_PROJECT
  process.env.SWC_NODE_PROJECT = configPath
  const defaultOptions = readDefaultTsConfig()
  const { config } = ts.readConfigFile(configPath, ts.sys.readFile)
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, dirname(configPath))
  t.deepEqual(omit(defaultOptions, 'files'), options)
})

test('should RESPECT TS_NODE_PROJECT env', (t) => {
  const configPath = join(__dirname, 'tsconfig.spec.json')
  delete process.env.SWC_NODE_PROJECT
  delete process.env.TS_NODE_PROJECT
  process.env.TS_NODE_PROJECT = configPath
  const defaultOptions = readDefaultTsConfig()
  const { config } = ts.readConfigFile(configPath, ts.sys.readFile)
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, dirname(configPath))
  t.deepEqual(omit(defaultOptions, 'files'), options)
})

test('should RESPECT tsconfig path in subdirectory', (t) => {
  const configPath = join(__dirname, 'subdirectory/tsconfig.extend.json')
  delete process.env.SWC_NODE_PROJECT
  delete process.env.TS_NODE_PROJECT
  process.env.TS_NODE_PROJECT = configPath
  const defaultOptions = readDefaultTsConfig()
  const { config } = ts.readConfigFile(configPath, ts.sys.readFile)
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, dirname(configPath))
  t.deepEqual(omit(defaultOptions, 'files'), options)
})

test('should return default compiler options when the tsConfigPath is invalid', (t) => {
  const configPath = join(__dirname, 'invalid', 'tsconfig.json')

  delete process.env.SWC_NODE_PROJECT
  delete process.env.TS_NODE_PROJECT
  process.env.TS_NODE_PROJECT = configPath

  const defaultOptions = readDefaultTsConfig()
  t.deepEqual(defaultOptions, {
    target: ts.ScriptTarget.ES2018,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    sourceMap: true,
    esModuleInterop: true,
  })
})

test('should RESPECT tsconfig path in subdirectory with a relative path', (t) => {
  const configPath = join('..', '__test__', 'tsconfig.spec.json')
  const fullConfigPath = join(__dirname, 'tsconfig.spec.json')

  delete process.env.SWC_NODE_PROJECT
  delete process.env.TS_NODE_PROJECT
  process.env.TS_NODE_PROJECT = configPath

  sinon.replace(process, 'cwd', () => __dirname)

  const defaultOptions = readDefaultTsConfig()

  sinon.restore()

  const { config } = ts.readConfigFile(fullConfigPath, ts.sys.readFile)
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, dirname(fullConfigPath))
  t.deepEqual(omit(defaultOptions, 'files'), options)
})
