// Preload ESM hook from this package's own dependency tree.
// We avoid @swc-node/register/esm-register because that bootstrap resolves
// from process.cwd(), which can fail when the user app does not install
// @swc-node/register directly.
const { register } = require('node:module')
const { dirname, resolve } = require('node:path')
const { pathToFileURL } = require('node:url')

const registerPath = require.resolve('@swc-node/register')
const registerDirectory = dirname(registerPath)
const esmLoaderPath = resolve(registerDirectory, 'esm/esm.mjs')

register(pathToFileURL(esmLoaderPath).toString(), pathToFileURL(__filename).toString())
