import { Attachment, getMediaMetadataFromLocalFile, masterExam, MasteringResult } from '@digabi/exam-engine-mastering'
import { spawn } from 'child-process-promise'
import { promises as fs } from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import tmp from 'tmp-promise'
import * as uuid from 'uuid'
import webpack from 'webpack'
import { getOfflineWebpackConfig } from './getOfflineWebpackConfig'

// tslint:disable-next-line no-var-requires
const ffmpeg = require('ffmpeg-static')

export interface CreateOfflineExamOptions {
  /**
   * Create a media version of the exam. This will encode video and audio files
   * as x264/mp3 and not remove hidden references from the exam.
   */
  mediaVersion?: boolean
}

const defaultOptions: CreateOfflineExamOptions = {
  mediaVersion: false
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
  const results = await masterExam(source, () => uuid.v4(), getMediaMetadataFromLocalFile(resolveAttachment), {
    removeHiddenElements: !opts.mediaVersion
  })
  const cacheDirectory = await tmp.dir({ unsafeCleanup: true }).then(d => d.path)

  for (const result of results) {
    const examOutputDirectory = getExamOutputDirectory(result, examFile, outputDirectory)
    await runWebpack(result, examOutputDirectory, opts)

    for (const attachment of result.attachments) {
      await copyAttachment(attachment, resolveAttachment, examOutputDirectory, cacheDirectory, opts)
    }

    examOutputDirectories.push(examOutputDirectory)
  }

  await optimizeWithPuppeteer(examOutputDirectories)

  return examOutputDirectories
}

function getExamOutputDirectory(result: MasteringResult, examFile: string, outputDirectory: string) {
  const { examCode, dayCode, date, language } = result
  const shortLanguageCode = language.replace(/-.*$/, '')
  const dirname = examCode
    ? `${date && date + '_'}${examCode}${dayCode ? '_' + dayCode : ''}_${shortLanguageCode}`
    : `${path.basename(path.dirname(examFile))}_${language}_offline`
  return path.resolve(outputDirectory, dirname)
}

async function runWebpack(result: MasteringResult, examOutputDirectory: string, options: CreateOfflineExamOptions) {
  const config = getOfflineWebpackConfig(result, examOutputDirectory, options)
  await new Promise<string>((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err || stats.hasErrors()) {
        reject(err || stats.toString({ colors: true }))
      } else {
        resolve()
      }
    })
  })
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
      await await fs.copyFile(cachedFilename, newTarget)
    } catch (err) {
      await spawn(ffmpeg, ['-i', source, '-c:v', 'libx264', '-c:a', 'libmp3lame', '-q:a', '4', cachedFilename])
      await fs.copyFile(cachedFilename, newTarget)
    }
  }

  return fs.copyFile(source, target)
}

async function optimizeWithPuppeteer(examOutputDirectories: string[]) {
  const browser = await puppeteer.launch()
  try {
    const context = await browser.createIncognitoBrowserContext()
    const page = await context.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    for (const examOutputDirectory of examOutputDirectories) {
      for (const htmlFile of [
        path.resolve(examOutputDirectory, 'index.html'),
        path.resolve(examOutputDirectory, 'attachments/index.html')
      ]) {
        await page.goto('file://' + htmlFile, { waitUntil: 'networkidle0' })
        await page.evaluate(() => {
          // Fix asset path on attachments page.
          if (location.pathname.includes('attachments/index.html')) {
            const style = document.head.querySelector(':scope > style')!
            style.textContent = style.textContent!.replace(/url\(assets\//g, 'url(../assets/')
          }
          // Remove rich-text-editor injected styles
          Array.from(document.head.querySelectorAll(':scope > style'))
            .filter(e => !e.textContent!.includes('NotoSans'))
            .forEach(e => e.remove())
          // Remove rich-text-editor injected HTML.
          document.body.querySelectorAll(':scope > :not(main)').forEach(e => e.remove())
        })
        const prerenderedContent = await page.content()
        await fs.writeFile(htmlFile, prerenderedContent, 'utf-8')
      }
    }
  } finally {
    await browser.close()
  }
}
