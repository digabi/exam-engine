import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { Attachment, getMediaMetadataFromLocalFile, masterExam, MasteringResult } from '@digabi/exam-engine-mastering'
import esbuild from 'esbuild'
import ffmpeg from 'ffmpeg-static'
import puppeteer from 'puppeteer'
import { getOfflineBuildOptions, publicDirectory } from './build'

const execFileAsync = promisify(execFile)

export interface CreateOfflineExamOptions {
  /**
   * Create a media version of the exam. This will encode video and audio files
   * as x264/mp3.
   */
  mediaVersion?: boolean

  /**
   * Which type will be created, offline without grading-instruction or just grading-instructions
   */
  type?: 'offline' | 'grading-instructions'
}

const defaultOptions: CreateOfflineExamOptions = {
  mediaVersion: false,
  type: 'offline'
}

export async function createOfflineExam(
  examFile: string,
  outputDirectory: string,
  options: CreateOfflineExamOptions = {}
): Promise<string[]> {
  const opts = { ...defaultOptions, ...options }
  const resolveAttachment = (filename: string) => path.resolve(path.dirname(examFile), 'attachments', filename)
  const source = await fs.readFile(examFile, 'utf-8')
  const examOutputDirectories: string[] = []
  const results = await masterExam(source, () => randomUUID(), getMediaMetadataFromLocalFile(resolveAttachment), {
    removeCorrectAnswers: false
  })
  const cacheDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'exam-cache-'))

  for (const result of results) {
    const examOutputDirectory = getExamOutputDirectory(result, outputDirectory)
    await esbuild.build(getOfflineBuildOptions(result, options, examOutputDirectory))
    await fs.mkdir(path.resolve(examOutputDirectory, 'attachments'), { recursive: true })
    await copyOfflineHtmlFiles(examOutputDirectory, opts)

    for (const attachment of result.attachments) {
      if (
        (opts.type === 'offline' && !attachment.withinGradingInstruction) ||
        (opts.type === 'grading-instructions' && attachment.visibleInGradingInstructions)
      ) {
        await copyAttachment(attachment, resolveAttachment, examOutputDirectory, cacheDirectory, opts)
      }
    }

    examOutputDirectories.push(examOutputDirectory)
  }

  await optimizeWithPuppeteer(examOutputDirectories, opts)
  await fs.rm(cacheDirectory, { recursive: true, force: true })

  return examOutputDirectories
}

function getExamOutputDirectory(result: MasteringResult, outputDirectory: string) {
  const { examCode, dayCode, date, language, type } = result
  const shortLanguageCode = language.split('-')[0]
  const examType = type === 'visually-impaired' ? 'vi' : type === 'hearing-impaired' ? 'hi' : ''
  const dirname = [date, examCode, dayCode, shortLanguageCode, examType].filter(Boolean).join('_')
  return path.resolve(outputDirectory, dirname)
}

async function copyOfflineHtmlFiles(examOutputDirectory: string, options: CreateOfflineExamOptions) {
  if (options.type === 'offline') {
    await Promise.all([
      fs.copyFile(path.resolve(publicDirectory, 'offline.html'), path.resolve(examOutputDirectory, 'index.html')),
      fs.copyFile(
        path.resolve(publicDirectory, 'offline-attachments.html'),
        path.resolve(examOutputDirectory, 'attachments/index.html')
      )
    ])
  }
  if (options.type === 'grading-instructions') {
    await fs.copyFile(
      path.resolve(publicDirectory, 'grading-instructions.html'),
      path.resolve(examOutputDirectory, 'grading-instructions.html')
    )
  }
}

async function copyAttachment(
  attachment: Attachment,
  resolveAttachment: (src: string) => string,
  examOutputDirectory: string,
  cacheDirectory: string,
  options: CreateOfflineExamOptions
) {
  const source = resolveAttachment(attachment.filename)
  const target = path.resolve(examOutputDirectory, 'attachments', attachment.filename)

  if (options.mediaVersion && ['.webm', '.ogg'].includes(path.extname(source))) {
    const newFilename = attachment.filename.replace(/\.ogg$/, '.mp3').replace(/\.webm$/, '.mp4')
    const newTarget = path.resolve(examOutputDirectory, 'attachments', newFilename)
    const cachedFilename = path.resolve(cacheDirectory, newFilename)
    try {
      await fs.copyFile(cachedFilename, newTarget)
    } catch (err) {
      if (ffmpeg) {
        await execFileAsync(ffmpeg, [
          '-i',
          source,
          '-c:v',
          'libx264',
          '-c:a',
          'libmp3lame',
          '-q:a',
          '4',
          cachedFilename
        ])
      }
      await fs.copyFile(cachedFilename, newTarget)
    }
  }

  return fs.copyFile(source, target)
}

async function optimizeWithPuppeteer(examOutputDirectories: string[], options: CreateOfflineExamOptions) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  try {
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    for (const examOutputDirectory of examOutputDirectories) {
      for (const htmlFile of [
        ...(options.type === 'offline'
          ? [
              path.resolve(examOutputDirectory, 'index.html'),
              path.resolve(examOutputDirectory, 'attachments/index.html')
            ]
          : [path.resolve(examOutputDirectory, 'grading-instructions.html')])
      ]) {
        await page.goto(`file://${htmlFile}`)
        await page.waitForSelector('.e-exam')
        await page.evaluate(() => {
          // Remove rich-text-editor injected styles
          Array.from(document.head.querySelectorAll(':scope > style'))
            .filter(e => !e.textContent.includes('NotoSans'))
            .forEach(e => e.remove())
          // Remove rich-text-editor injected HTML.
          document.body.querySelectorAll(':scope > :not(#app)').forEach(e => e.remove())
        })
        const prerenderedContent = await page.content()
        await fs.writeFile(htmlFile, prerenderedContent, 'utf-8')
      }
    }
  } finally {
    await browser.close()
  }
}
