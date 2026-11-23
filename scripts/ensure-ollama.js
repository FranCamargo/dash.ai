import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import process from 'node:process'

const apiUrl = 'http://127.0.0.1:11434/api/tags'
const startupTimeoutMs = 60_000

function getOllamaExecutable() {
  if (process.env.OLLAMA_EXECUTABLE) return process.env.OLLAMA_EXECUTABLE

  const windowsExecutable = process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, 'Programs', 'Ollama', 'ollama.exe')
    : null

  if (windowsExecutable && existsSync(windowsExecutable)) return windowsExecutable
  return 'ollama'
}

async function isOllamaReady() {
  try {
    const response = await fetch(apiUrl, { signal: AbortSignal.timeout(2_000) })
    return response.ok
  } catch (error) {
    const connectionRefused = error.cause?.code === 'ECONNREFUSED'
      || error.cause?.errors?.some(cause => cause.code === 'ECONNREFUSED')
    if (error.name === 'TimeoutError' || connectionRefused) return false
    throw error
  }
}

function startOllama() {
  const executable = getOllamaExecutable()
  return new Promise((resolve, reject) => {
    const child = spawn(executable, ['serve'], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    })
    child.once('error', reject)
    child.once('spawn', () => {
      child.unref()
      resolve(child)
    })
  })
}

async function waitForOllama(child) {
  const deadline = Date.now() + startupTimeoutMs
  while (Date.now() < deadline) {
    if (await isOllamaReady()) return
    if (child.exitCode !== null) {
      throw new Error(`Ollama exited before its API became ready (code ${child.exitCode}).`)
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  throw new Error(`Ollama API did not become ready within ${startupTimeoutMs / 1000} seconds.`)
}

if (await isOllamaReady()) {
  console.log('Ollama is already running.')
} else {
  console.log('Starting Ollama...')
  let child
  try {
    child = await startOllama()
  } catch (error) {
    throw new Error(
      `Could not start Ollama. Set OLLAMA_EXECUTABLE to its executable path. ${error.message}`,
      { cause: error },
    )
  }
  await waitForOllama(child)
  console.log('Ollama is ready.')
}
