import { Attachment, getMediaMetadataFromLocalFile, masterExam, MasteringResult } from '@digabi/exam-engine-mastering'
import { spawn } from 'child-process-promise'
import { promises as fs } from 'fs'
import path from 'path'
import * as cheerio from 'cheerio'
import tmp from 'tmp-promise'
import * as uuid from 'uuid'
import webpack from 'webpack'
import { getOfflineWebpackConfig } from './getOfflineWebpackConfig'
import ffmpeg from 'ffmpeg-static'

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
  const results = await masterExam(source, () => uuid.v4(), getMediaMetadataFromLocalFile(resolveAttachment), {
    removeCorrectAnswers: false
  })
  const cacheDirectory = await tmp.dir({ unsafeCleanup: true }).then(d => d.path)

  for (const result of results) {
    const examOutputDirectory = getExamOutputDirectory(result, outputDirectory)
    await runWebpack(result, examOutputDirectory, opts)

    await fs.mkdir(`${examOutputDirectory}/attachments`, { recursive: true })

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

  return examOutputDirectories
}

function getExamOutputDirectory(result: MasteringResult, outputDirectory: string) {
  const { examCode, dayCode, date, language, type } = result
  const shortLanguageCode = language.split('-')[0]
  const examType = type === 'visually-impaired' ? 'vi' : type === 'hearing-impaired' ? 'hi' : ''
  const dirname = [date, examCode, dayCode, shortLanguageCode, examType].filter(Boolean).join('_')
  return path.resolve(outputDirectory, dirname)
}

async function runWebpack(result: MasteringResult, examOutputDirectory: string, options: CreateOfflineExamOptions) {
  const config = getOfflineWebpackConfig(result, examOutputDirectory, options)
  await new Promise<string | void>((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err || stats?.hasErrors()) {
        reject(err || new Error(stats?.toString({ colors: true })))
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
      await fs.copyFile(cachedFilename, newTarget)
    } catch (err) {
      if (ffmpeg) {
        await spawn(ffmpeg, ['-i', source, '-c:v', 'libx264', '-c:a', 'libmp3lame', '-q:a', '4', cachedFilename])
      }
      await fs.copyFile(cachedFilename, newTarget)
    }
  }

  return fs.copyFile(source, target)
}

async function optimizeWithPuppeteer(examOutputDirectories: string[], options: CreateOfflineExamOptions) {
  try {
    for (const examOutputDirectory of examOutputDirectories) {
      for (const htmlFile of [
        ...(options.type === 'offline'
          ? [
              path.resolve(examOutputDirectory, 'index.html'),
              path.resolve(examOutputDirectory, 'attachments/index.html')
            ]
          : [path.resolve(examOutputDirectory, 'grading-instructions.html')])
      ]) {
        const file = await fs.readFile(htmlFile, 'utf-8')
        const $ = cheerio.load(file)

        // Fix asset path on attachments page.
        if (htmlFile.includes('attachments/index.html')) {
          $('head > style').each((_, element) => {
            $(element).text(
              $(element)
                .text()
                .replace(/url\(assets\//g, 'url(../assets/')
            )
          })
        }

        // Remove rich-text-editor injected styles
        $('head > style')
          .filter((_, element) => !$(element).text().includes('NotoSans'))
          .each((_, element) => {
            $(element).remove()
          })

        // Remove rich-text-editor injected HTML.
        $('body > :not(#app)').each((_, element) => {
          $(element).remove()
        })

        await fs.writeFile(htmlFile, $.html(), 'utf-8')
      }
    }
  } catch (e) {
    console.error(e)
  }
}
