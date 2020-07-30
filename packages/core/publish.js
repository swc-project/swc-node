const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const platforms = require('./platforms')

for (const name of platforms) {
  const pkgDir = path.join(__dirname, 'npm', `core-${name}`)
  const filename = `swc.${name}.node`
  const bindingFile = fs.readFileSync(path.join(__dirname, filename))
  fs.writeFileSync(path.join(pkgDir, filename), bindingFile)
  execSync('npm publish', {
    cwd: pkgDir,
    env: process.env,
    stdio: 'inherit',
  })
}
