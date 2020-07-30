const { execSync } = require('child_process')
const path = require('path')

const { version } = require('./package.json')
const platforms = require('./platforms')
const updatePackageJson = require('./update-package')

updatePackageJson(path.join(__dirname, 'package.json'), {
  optionalDependencies: platforms.reduce((acc, cur) => {
    acc[`@swc-node/core-${cur}`] = `^${version}`
    return acc
  }, {}),
})

for (const name of platforms) {
  const pkgDir = path.join(__dirname, 'npm', `core-${name}`)
  updatePackageJson(path.join(pkgDir, 'package.json'), {
    version,
  })
}

execSync('git add .', {
  stdio: 'inherit',
})
