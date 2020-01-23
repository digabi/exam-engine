import { resolveExam } from '@digabi/exam-engine-exams'
import { mkGetMediaMetadata } from '@digabi/exam-engine-mastering'
import glob from 'glob'
import path from 'path'

const getMediaMetadata = mkGetMediaMetadata(resolveExam)

describe('mkGetMediaMetadata', () => {
  for (const [globPattern, type] of [
    ['**/*/*.{jpg,png}', 'image'],
    ['**/*/*.{mp3,ogg}', 'audio'],
    ['**/*/*.{webm,mp4}', 'video']
  ] as const) {
    for (const file of glob.sync(resolveExam(globPattern))) {
      it(`reads ${type} metadata for ${path.relative(resolveExam('.'), file)}`, () => {
        return expect(getMediaMetadata(file, type)).resolves.toMatchSnapshot()
      })
    }
  }
})
