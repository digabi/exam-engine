import { spawn } from 'node:child_process'
import { createServer, IncomingMessage, request, Server, ServerResponse } from 'node:http'
import { promises as fs, watch as fsWatch, FSWatcher } from 'node:fs'
import { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pipeline } from 'node:stream'
import esbuild from 'esbuild'
import { mathSvgResponse } from 'rich-text-editor/server/mathSvg'
import { RenderingOptions } from '.'
import { getPreviewBuildOptions, publicDirectory } from './build'

export interface PreviewContext {
  url: string
  close: () => Promise<void>
}

export async function previewExam(examFile: string, options: RenderingOptions = {}): Promise<PreviewContext> {
  const examDir = path.dirname(examFile)
  const tempDir = await fs.mkdtemp(path.join(tmpdir(), 'preview-'))

  let context: esbuild.BuildContext | undefined
  let examDirWatcher: FSWatcher | undefined

  try {
    examDirWatcher = await linkExamFiles(examDir, tempDir)
    context = await esbuild.context(getPreviewBuildOptions(examFile, options, tempDir))
    await context.watch()
    const esbuildServer = await context.serve({
      host: '127.0.0.1',
      port: 0,
      servedir: tempDir,
      fallback: path.resolve(publicDirectory, 'index.html')
    })
    const server = createServer((req, res) => proxyRequest(req, res, esbuildServer.port))
    await listen(server, options.port ?? 0)

    const address = server.address() as AddressInfo
    const url = `http://localhost:${address.port}`

    if (options.openBrowser) {
      openBrowser(url)
    }

    return {
      url,
      close: async () => {
        try {
          examDirWatcher!.close()
          const closed = new Promise<void>((resolve, reject) => server.close(e => (e ? reject(e) : resolve())))
          server.closeAllConnections()
          await Promise.all([context!.dispose(), closed])
        } finally {
          await fs.rm(tempDir, { recursive: true, force: true })
        }
      }
    }
  } catch (error) {
    examDirWatcher?.close()
    await context?.dispose()
    await fs.rm(tempDir, { recursive: true, force: true })
    throw error
  }
}

async function linkExamFiles(examDir: string, tempDir: string) {
  const entries = await fs.readdir(examDir)
  await Promise.all(entries.map(filename => linkFile(examDir, tempDir, filename)))

  return fsWatch(examDir, (_eventType, filename) => {
    if (filename) {
      void linkFile(examDir, tempDir, filename).catch(() => undefined)
    }
  })
}

async function linkFile(examDir: string, tempDir: string, file: string) {
  const source = path.resolve(examDir, file)
  const target = path.resolve(tempDir, file)

  try {
    await fs.lstat(source)
  } catch {
    return
  }

  try {
    await fs.lstat(target)
  } catch {
    try {
      await fs.symlink(source, target)
    } catch {
      /* ignore errors */
    }
  }
}

function proxyRequest(req: IncomingMessage, res: ServerResponse, port: number) {
  const url = new URL(req.url ?? '/', 'http://localhost')

  // Disables automatic reload in tests
  if (url.pathname === '/esbuild' && process.env.NODE_ENV === 'test') {
    res.writeHead(404)
    res.end()
    return
  }

  if (url.pathname === '/math.svg') {
    mathSvgResponse({ query: { latex: url.searchParams.get('latex') ?? undefined } } as { query: { latex: string } }, {
      type: () => res.setHeader('Content-Type', 'image/svg+xml'),
      sendStatus: status => res.writeHead(status).end(),
      send: body => res.end(body)
    })
    return
  }

  const onError = (error?: Error | null) => {
    if (!error || req.destroyed || res.destroyed || res.writableEnded) {
      return
    }
    if (!res.headersSent) {
      res.writeHead(502)
    }
    res.end(error.message)
  }

  const proxy = request(
    {
      host: '127.0.0.1',
      port,
      method: req.method,
      path: req.url,
      headers: req.headers
    },
    proxyRes => {
      if (res.destroyed) {
        proxyRes.destroy()
        return
      }
      res.writeHead(proxyRes.statusCode ?? 500, proxyRes.headers)
      pipeline(proxyRes, res, onError)
    }
  )
  pipeline(req, proxy, onError)
}

function listen(server: Server, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', () => {
      server.off('error', reject)
      resolve()
    })
  })
}

function openBrowser(url: string) {
  const child = spawn('open', [url], { detached: true, stdio: 'ignore' })
  child.unref()
}
