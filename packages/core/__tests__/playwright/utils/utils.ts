import { resolveExam } from '@digabi/exam-engine-exams'
import { readFile } from 'fs/promises'
import { Locator, Page } from '@playwright/test'
import path from 'path'
import { getMediaMetadataFromLocalFile, masterExam, MasteringResult } from '@digabi/exam-engine-mastering'

export async function setupMasteredExam(filePath: string = 'SC/SC.xml'): Promise<MasteringResult> {
  const examPath = resolveExam(`${filePath}`)
  const resolveAttachment = (filename: string) => path.resolve(path.dirname(examPath), 'attachments', filename)
  const examXml = await readFile(examPath, 'utf-8')
  const [masteredExam] = await masterExam(examXml, () => '', getMediaMetadataFromLocalFile(resolveAttachment), {
    removeCorrectAnswers: true
  })
  return masteredExam
}

export async function annotateText(locator: Locator, page: Page, selectionWidth = 200) {
  await locator.scrollIntoViewIfNeeded() // Scroll the element into view
  const box = await locator.boundingBox()
  if (!box) throw new Error('Bounding box not found')
  const startX = box.x + 1
  const startY = box.y + 1
  const endX = box.x + selectionWidth // Move further to the right to select text
  const endY = startY

  // Simulate dragging the mouse to select text
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(endX, endY)
  await page.mouse.up()
}

export async function annotateImage(locator: Locator, page: Page) {
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  if (!box) throw new Error('Bounding box not found')
  const startX = box.x
  const startY = box.y
  const endX = box.x + box.width + 1
  const endY = box.y + box.height + 1

  // Simulate dragging the mouse to select text
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(endX, endY)
  await page.mouse.up()
}
