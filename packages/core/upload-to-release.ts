import { execSync } from 'child_process'
import { join } from 'path'

import { Octokit } from '@octokit/rest'
import chalk from 'chalk'
// @ts-expect-error
import putasset from 'putasset'

import platforms from './platforms'

const headCommit = execSync('git log -1 --pretty=%B', {
  encoding: 'utf8',
})

;(async () => {
  const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/')
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  })
  const core = headCommit
    .split('\n')
    .map((line) => line.trim())
    .filter((line, index) => line.length && index)
    .map((line) => line.substr(2))
    .map(parseTag)
    .find((pkgInfo) => pkgInfo.isNativePackage)
  if (core) {
    await octokit.repos.createRelease({
      owner,
      repo,
      tag_name: core.tag,
    })
    await Promise.all(
      [...platforms, 'linux-musl'].map(async (platform) => {
        const binary = join(__dirname, `bindings-${platform}`, `swc.${platform}.node`)
        const downloadUrl = await putasset(process.env.GITHUB_TOKEN, {
          owner,
          repo,
          tag: core.tag,
          filename: binary,
        })
        console.info(`${chalk.green(binary)} upload success`)
        console.info(`Download url: ${chalk.blueBright(downloadUrl)}`)
      }),
    )
  }
})().catch((e) => {
  console.error(e)
})

function parseTag(tag: string) {
  const [, packageWithVersion] = tag.split('/')
  const [name, version] = packageWithVersion.split('@')
  const isNativePackage = name === 'core'

  return {
    name,
    version,
    tag,
    isNativePackage,
  }
}
