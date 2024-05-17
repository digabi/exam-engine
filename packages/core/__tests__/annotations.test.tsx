import { fireEvent, render, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Exam, { AnnotationProps, ExamProps } from '../src/components/exam/Exam'
import GradingInstructions from '../src/components/grading-instructions/GradingInstructions'
import { promises as fs } from 'fs'
import { getMediaMetadataFromLocalFile, masterExam } from '@digabi/exam-engine-mastering'
import { resolveExam } from '@digabi/exam-engine-exams'
import path from 'path'
import parseExam from '../dist/parser/parseExam'
import { examServerApi } from './examServerApi'
import React from 'react'
import '@testing-library/jest-dom'
import Attachments from '../src/components/attachments/Attachments'
import { ExamAnnotation } from '../src'

class IntersectionObserver {
  root = null
  rootMargin = ''
  thresholds = []
  disconnect = () => null
  observe = () => null
  takeRecords = () => []
  unobserve = () => null
}
window.IntersectionObserver = IntersectionObserver
global.IntersectionObserver = IntersectionObserver
window.scrollTo = jest.fn()
document.execCommand = jest.fn()

describe('Annotations', () => {
  let doc: XMLDocument

  beforeEach(async () => {
    window.getSelection = jest.fn()

    const examPath = resolveExam('FF/FF.xml')
    const resolveAttachment = (filename: string) => path.resolve(path.dirname(examPath), 'attachments', filename)
    const source = await fs.readFile(examPath, 'utf-8')
    const results = await masterExam(source, () => '', getMediaMetadataFromLocalFile(resolveAttachment), {
      removeCorrectAnswers: false
    })
    doc = parseExam(results[0].xml, true)
  })

  afterEach(() => {
    ;(window.getSelection as jest.Mock).mockReset()
    ;(window.scrollTo as jest.Mock).mockReset()
    ;(document.execCommand as jest.Mock).mockReset()
  })

  const defaultTextToAnnotate = 'Sekä moraali että tavat pyrkivät ohjaamaan ihmisten käyttäytymistä.'
  const defaultAnnotationAnchor =
    'e:exam:0 > e:section:1 > e:question:2 > e:question-instruction:1 > span:0 > p:0 > #text:0'

  it('popup is rendered', async () => {
    const exam = render(
      <Exam {...getExamProps()} annotations={{}} onClickAnnotation={() => {}} onSaveAnnotation={() => {}} />
    )
    await annotateText(exam, defaultTextToAnnotate)
    expect(exam.getByTestId('annotation-popup')).toBeVisible()
  })

  it('popup is not rendered if annotation props are not passed', async () => {
    const exam = render(<Exam {...getExamProps()} />)
    await annotateText(exam, defaultTextToAnnotate)
    expect(exam.queryByTestId('annotation-popup')).not.toBeInTheDocument()
  })

  it('callback is called when annotation is saved', async () => {
    const saveAnnotationMock = jest.fn()
    const exam = render(
      <Exam {...getExamProps()} annotations={{}} onClickAnnotation={() => {}} onSaveAnnotation={saveAnnotationMock} />
    )
    await annotateText(exam, defaultTextToAnnotate)

    const textbox = exam.getByTestId('edit-comment')
    fireEvent.input(textbox, {
      target: { innerText: 'New Value', innerHTML: 'New Value' }
    })
    await userEvent.click(exam.getByText('Vastaa'))

    expect(saveAnnotationMock).toHaveBeenCalledTimes(1)
    expect(saveAnnotationMock).toHaveBeenCalledWith({
      annotationAnchor: defaultAnnotationAnchor,
      annotationId: undefined,
      displayNumber: '2',
      length: defaultTextToAnnotate.length,
      message: 'New Value',
      selectedText: defaultTextToAnnotate,
      startIndex: 67
    })
  })

  it('popup field is empty when creating new annotation', async () => {
    const exam = render(
      <Exam {...getExamProps()} annotations={{}} onClickAnnotation={() => {}} onSaveAnnotation={() => {}} />
    )
    await annotateText(exam, defaultTextToAnnotate)
    const textbox = exam.getByTestId('edit-comment')
    fireEvent.input(textbox, {
      target: { innerText: 'New Value', innerHTML: 'New Value' }
    })
    await userEvent.click(exam.getByText('Vastaa'))
    await annotateText(exam, 'Esitä jokin toinen käsitys filosofiasta ja vertaa sitä')
    expect(exam.getByTestId('edit-comment').textContent).toHaveLength(0)
  })

  it('callback is called when annotation is clicked', async () => {
    const clickAnnotationMock = jest.fn()
    const exam = render(
      <Exam
        {...getExamProps()}
        annotations={{ [defaultAnnotationAnchor]: [createAnnotation(1, 1, 1)] }}
        onClickAnnotation={clickAnnotationMock}
        onSaveAnnotation={() => {}}
      />
    )
    await userEvent.click(exam.container.querySelector('[data-annotation-id="1"]')!)

    expect(clickAnnotationMock).toHaveBeenCalledTimes(1)
    expect(clickAnnotationMock).toHaveBeenCalledWith(expect.anything(), {
      annotationAnchor: defaultAnnotationAnchor,
      annotationId: 1,
      displayNumber: '',
      hidden: false,
      length: 1,
      message: '',
      selectedText: '',
      startIndex: 1
    })
  })

  it('annotations are added to dom when provided', () => {
    const annotationProps: AnnotationProps = {
      annotations: {
        [defaultAnnotationAnchor]: [createAnnotation(1, 1, 1), createAnnotation(3, 4, 2)]
      },
      onClickAnnotation: () => {},
      onSaveAnnotation: () => {}
    }
    const exam = render(<Exam {...getExamProps()} {...annotationProps} />)
    expect(exam.container.querySelector('[data-annotation-id="1"]')).toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="3"]')).toBeInTheDocument()
  })

  it('grading instructions can be annotated', async () => {
    const gi = render(
      <GradingInstructions
        {...getCommonProps()}
        annotations={{}}
        onClickAnnotation={() => {}}
        onSaveAnnotation={() => {}}
      />
    )
    await annotateText(gi, defaultTextToAnnotate)
    expect(gi.getByTestId('annotation-popup')).toBeVisible()
  })

  it('attachments can be annotated', async () => {
    const gi = render(
      <Attachments {...getCommonProps()} annotations={{}} onClickAnnotation={() => {}} onSaveAnnotation={() => {}} />
    )
    await annotateText(gi, 'Mollit sint magna aliquip in.')
    expect(gi.getByTestId('annotation-popup')).toBeVisible()
  })

  function createAnnotation(id: number, startIndex: number, length: number): ExamAnnotation {
    return {
      annotationId: id,
      annotationAnchor: defaultAnnotationAnchor,
      hidden: false,
      startIndex,
      length,
      message: '',
      displayNumber: '',
      selectedText: ''
    }
  }

  async function annotateText(exam: RenderResult, text: string) {
    mockWindowSelection(text, text.length)
    const textElement = exam.getByText(text)
    await userEvent.click(textElement)
  }

  function mockWindowSelection(text = 'mocked selection text', length = 5) {
    ;(window.getSelection as jest.Mock).mockImplementation(() => ({
      toString: () => text,
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        startOffset: 0,
        endOffset: length,
        startContainer: {},
        endContainer: {},
        cloneContents: jest.fn().mockReturnValue({ children: [], childNodes: [] })
      })
    }))
  }

  function getCommonProps() {
    return {
      doc,
      answers: [],
      attachmentsURL: '/attachments',
      resolveAttachment: (filename: string) => `/attachments/${encodeURIComponent(filename)}`
    }
  }

  function getExamProps() {
    const examProps: ExamProps = {
      ...getCommonProps(),
      casStatus: 'forbidden',
      examServerApi,
      restrictedAudioPlaybackStats: [],
      studentName: '[Kokelaan Nimi]',
      showUndoView: false,
      undoViewProps: {
        questionId: 0,
        title: '',
        close: () => undefined,
        restoreAnswer: () => undefined
      }
    }
    return examProps
  }
})
