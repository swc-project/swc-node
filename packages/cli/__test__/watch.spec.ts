import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import test from 'ava'

import { spawnCli } from './helpers/run-cli'
import { ChildProcess } from 'node:child_process'

const fixturesDir = join(__dirname, 'fixtures')

test.serial('watch mode restarts on change and exits cleanly', async (t) => {
  t.timeout(30000)

  const fixtureDir = join(fixturesDir, 'watch')
  const triggerFile = join(fixtureDir, 'trigger.txt')
  const originalTrigger = await readFile(triggerFile, 'utf8')

  const child = spawnCli(['--watch-preserve-output', '--watch-path=./trigger.txt', './index.ts'], {
    cwd: fixtureDir,
    detached: true,
  })

  let output = ''
  child.stdout?.on('data', (chunk: Buffer | string) => {
    output += chunk.toString()
  })
  child.stderr?.on('data', (chunk: Buffer | string) => {
    output += chunk.toString()
  })

  try {
    await waitFor(() => countRuns(output) >= 1, 12000)

    await writeFile(triggerFile, `v2-${Date.now()}\n`)

    await waitFor(() => countRuns(output) >= 2, 12000)

    if (child.pid) {
      try {
        process.kill(-child.pid, 'SIGTERM')
      } catch {
        child.kill('SIGTERM')
      }
    } else {
      child.kill('SIGTERM')
    }

    const closed = await waitForClose(child, 8000)
    t.true(closed.signal === 'SIGTERM' || closed.code !== null)
  } finally {
    if (child.pid && isProcessAlive(child.pid)) {
      try {
        process.kill(-child.pid, 'SIGKILL')
      } catch {
        child.kill('SIGKILL')
      }
    }
    await writeFile(triggerFile, originalTrigger)
  }
})

async function waitFor(check: () => boolean, timeoutMs: number): Promise<void> {
  const start = Date.now()

  for (;;) {
    if (check()) {
      return
    }

    if (Date.now() - start >= timeoutMs) {
      throw new Error('Timed out while waiting for condition')
    }

    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

function waitForClose(
  child: ChildProcess,
  timeoutMs: number,
): Promise<{ code: number | null; signal: NodeJS.Signals | null }> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timed out waiting for watched process to close'))
    }, timeoutMs)

    //@ts-ignore - TODO: Fix type errors
    child.on('close', (code, signal) => {
      clearTimeout(timeout)
      resolve({ code, signal })
    })
  })
}

function countRuns(output: string): number {
  return output.split('watch-run').length - 1
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}
