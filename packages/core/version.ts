import { execSync } from 'child_process'
import path from 'path'

import { version } from './package.json'
import platforms from './platforms'
import updatePackageJson from './update-package'

for (const name of [...platforms, 'linux-musl']) {
  const pkgDir = path.join(__dirname, 'npm', `core-${name}`)
  updatePackageJson(path.join(pkgDir, 'package.json'), {
    version,
  })
}

execSync('git add .', {
  stdio: 'inherit',
})
