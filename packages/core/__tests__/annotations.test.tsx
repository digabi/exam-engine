import { resolveExam } from '@digabi/exam-engine-exams'
import { getMediaMetadataFromLocalFile, masterExam } from '@digabi/exam-engine-mastering'
import '@testing-library/jest-dom'
import { fireEvent, render, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { promises as fs } from 'fs'
import path from 'path'
import React from 'react'
import parseExam from '../dist/parser/parseExam'
import { ExamAnnotation } from '../src'
import Attachments from '../src/components/attachments/Attachments'
import Exam, { AnnotationProps, ExamProps } from '../src/components/exam/Exam'
import GradingInstructions from '../src/components/grading-instructions/GradingInstructions'
import { examServerApi } from './examServerApi'

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
    await annotateText(exam, defaultAnnotationAnchor)
    expect(exam.getByTestId('annotation-popup')).toBeVisible()
  })

  it('popup is not rendered if annotation props are not passed', async () => {
    const exam = render(<Exam {...getExamProps()} />)
    const text = 'Sekä moraali että tavat pyrkivät ohjaamaan ihmisten käyttäytymistä.'
    const textElement = exam.getByText(text)
    mockWindowSelection(text, textElement, 0, text.length)
    await userEvent.click(textElement)
    expect(exam.queryByTestId('annotation-popup')).not.toBeInTheDocument()
  })

  it('callback is called when annotation is saved', async () => {
    const saveAnnotationMock = jest.fn()
    const exam = render(
      <Exam {...getExamProps()} annotations={{}} onClickAnnotation={() => {}} onSaveAnnotation={saveAnnotationMock} />
    )
    await annotateText(exam, defaultAnnotationAnchor)

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
      startIndex: 0
    })
  })

  it('popup field is empty when creating new annotation', async () => {
    const annotationAnchor_7_1 =
      'e:exam:0 > e:section:2 > e:question:7 > e:question:7.1 > e:question-title:0 > span:0 > #text:0'
    const exam = render(
      <Exam {...getExamProps()} annotations={{}} onClickAnnotation={() => {}} onSaveAnnotation={() => {}} />
    )
    await annotateText(exam, defaultAnnotationAnchor)
    const textbox = exam.getByTestId('edit-comment')
    fireEvent.input(textbox, {
      target: { innerText: 'New Value', innerHTML: 'New Value' }
    })
    await userEvent.click(exam.getByText('Vastaa'))
    // text picked by getMarkedText includes leading/trailing whitespace, so they must be here too
    await annotateText(exam, annotationAnchor_7_1)
    expect(exam.getByTestId('edit-comment').textContent).toHaveLength(0)
  })

  it('callback is called when annotation is clicked', async () => {
    const clickAnnotationMock = jest.fn()
    const exam = render(
      <Exam
        {...getExamProps()}
        annotations={{ [defaultAnnotationAnchor]: [createAnnotation(1, 5, 12, 'moraali että')] }}
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
      length: 12,
      message: '',
      selectedText: 'moraali että',
      startIndex: 5
    })
  })

  it('annotations are added to dom when provided', () => {
    const annotationProps: AnnotationProps = {
      annotations: {
        [defaultAnnotationAnchor]: [createAnnotation(1, 5, 7, 'moraali'), createAnnotation(3, 18, 5, 'tavat')]
      },
      onClickAnnotation: () => {},
      onSaveAnnotation: () => {}
    }
    const exam = render(<Exam {...getExamProps()} {...annotationProps} />)
    expect(exam.container.querySelector('[data-annotation-id="1"]')).toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="1"]')?.textContent).toBe('moraali')
    expect(exam.container.querySelector('[data-annotation-id="3"]')).toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="3"]')?.textContent).toBe('tavat')
  })

  it('hidden annotation works correctly', () => {
    const annotationProps: AnnotationProps = {
      annotations: {
        [defaultAnnotationAnchor]: [
          {
            annotationId: 1,
            annotationAnchor: defaultAnnotationAnchor,
            hidden: true,
            startIndex: 24,
            length: 8,
            message: '',
            displayNumber: '',
            selectedText: 'pyrkivät'
          }
        ]
      },
      onClickAnnotation: () => {},
      onSaveAnnotation: () => {}
    }
    const exam = render(<Exam {...getExamProps()} {...annotationProps} />)
    expect(exam.container.querySelector('[data-annotation-id="1"]')).toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="1"]')?.parentElement?.textContent).toBe(
      'Sekä moraali että tavat pyrkivät ohjaamaan ihmisten käyttäytymistä.'
    )
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
    await annotateText(gi, defaultAnnotationAnchor)
    expect(gi.getByTestId('annotation-popup')).toBeVisible()
  })

  it('attachments can be annotated', async () => {
    const annotationAnchor_7_A =
      'e:exam:0 > e:section:2 > e:question:7 > e:external-material:3 > e:attachment:0 > span:1 > p:3 > #text:0'
    const gi = render(
      <Attachments {...getCommonProps()} annotations={{}} onClickAnnotation={() => {}} onSaveAnnotation={() => {}} />
    )
    await annotateText(gi, annotationAnchor_7_A)
    expect(gi.getByTestId('annotation-popup')).toBeVisible()
  })

  function createAnnotation(id: number, startIndex: number, length: number, selectedText: string): ExamAnnotation {
    return {
      annotationId: id,
      annotationAnchor: defaultAnnotationAnchor,
      hidden: false,
      startIndex,
      length,
      message: '',
      displayNumber: '',
      selectedText
    }
  }

  async function annotateText(exam: RenderResult, elementAnchor: string, startIndex = 0, length?: number) {
    const textElement = exam.getByTestId(elementAnchor)
    const fullText = textElement?.textContent || ''
    const annotationLength = length || fullText.length
    const text = fullText.substring(startIndex, startIndex + annotationLength)
    mockWindowSelection(text, textElement, startIndex, annotationLength)
    await userEvent.click(textElement)
  }

  function mockWindowSelection(text = 'mocked selection text', element: Element, startOffset = 0, length: number) {
    ;(window.getSelection as jest.Mock).mockImplementation(() => ({
      toString: () => text,
      rangeCount: 1,
      anchorNode: element.firstChild,
      focusNode: element.firstChild,
      getRangeAt: jest.fn().mockReturnValue({
        startOffset,
        endOffset: startOffset + length,
        startContainer: element,
        endContainer: element,
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
