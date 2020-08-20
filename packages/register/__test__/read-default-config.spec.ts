import { join } from 'path'

import test from 'ava'
import * as ts from 'typescript'

const { readDefaultTsConfig } = require('../register')

test('should read tsconfig from cwd if without any config', (t) => {
  delete process.env.SWC_NODE_PROJECT
  const defaultOptions = readDefaultTsConfig()
  const { config } = ts.readConfigFile(join(process.cwd(), 'tsconfig.json'), ts.sys.readFile)
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, process.cwd())
  t.deepEqual(defaultOptions, options)
})

test('should RESPECT SWC_NODE_PROJECT env', (t) => {
  const configPath = join(__dirname, 'tsconfig.spec.json')
  delete process.env.SWC_NODE_PROJECT
  delete process.env.TS_NODE_PROJECT
  process.env.SWC_NODE_PROJECT = configPath
  const defaultOptions = readDefaultTsConfig()
  const { config } = ts.readConfigFile(configPath, ts.sys.readFile)
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, process.cwd())
  t.deepEqual(defaultOptions, options)
})

test('should RESPECT TS_NODE_PROJECT env', (t) => {
  const configPath = join(__dirname, 'tsconfig.spec.json')
  delete process.env.SWC_NODE_PROJECT
  delete process.env.TS_NODE_PROJECT
  process.env.TS_NODE_PROJECT = configPath
  const defaultOptions = readDefaultTsConfig()
  const { config } = ts.readConfigFile(configPath, ts.sys.readFile)
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, process.cwd())
  t.deepEqual(defaultOptions, options)
})
