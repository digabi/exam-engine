import { resolveExam } from '@digabi/exam-engine-exams'
import { getMediaMetadataFromLocalFile, masterExam } from '@digabi/exam-engine-mastering'
import '@testing-library/jest-dom'
import { RenderResult, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { promises as fs } from 'fs'
import path from 'path'
import React from 'react'
import parseExam from '../dist/parser/parseExam'
import { AnnotationPart, ExamAnnotation, RenderableAnnotation } from '../src'
import Attachments from '../src/components/attachments/Attachments'
import Exam, { AnnotationProps, ExamProps } from '../src/components/exam/Exam'
import GradingInstructions from '../src/components/grading-instructions/GradingInstructions'
import { examServerApi } from './examServerApi'
import { groupBy } from 'lodash'

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

  // Do NOT modify the line breaks and indentations below
  const defaultTextToAnnotate = `
            Valitse jokin pienempi tai suurempi yhteisö – esimerkiksi jokin koulu, katsomuksellinen ryhmä tai valtio –
            ja pohdi, mikä ero valitsemassasi yhteisössä on moraalin ja tapojen välillä.
          `
  const defaultAnnotationAnchor =
    'e:exam:0 > e:section:1 > e:question:2 > e:question-instruction:1 > span:0 > p:1 > #text:0'

  it('popup is rendered', async () => {
    const exam = render(
      <Exam {...getExamProps()} annotations={[]} onClickAnnotation={() => {}} onSaveAnnotation={() => {}} />
    )
    await annotateText(exam, defaultAnnotationAnchor)
    expect(exam.getByTestId('annotation-popup')).toBeVisible()
  })

  it('popup is not rendered if annotation props are not passed', async () => {
    const exam = render(<Exam {...getExamProps()} />)
    const text = 'Sekä moraali että tavat pyrkivät ohjaamaan ihmisten käyttäytymistä.'
    const textElement = exam.getByText(text)
    mockWindowSelection(text, textElement, text.length)
    await userEvent.click(textElement)
    expect(exam.queryByTestId('annotation-popup')).not.toBeInTheDocument()
  })

  it('callback is called when annotation is saved', async () => {
    const saveAnnotationMock = jest.fn()
    const exam = render(
      <Exam {...getExamProps()} annotations={[]} onClickAnnotation={() => {}} onSaveAnnotation={saveAnnotationMock} />
    )
    await annotateText(exam, defaultAnnotationAnchor)

    const textbox = exam.getByTestId('edit-comment')
    fireEvent.input(textbox, {
      target: { innerText: 'New comment', innerHTML: 'New comment' }
    })
    await userEvent.click(exam.getByText('Tallenna'))

    const annotationPart: AnnotationPart = {
      annotationAnchor: defaultAnnotationAnchor,
      selectedText: defaultTextToAnnotate,
      startIndex: 0,
      length: defaultTextToAnnotate.length
    }

    expect(saveAnnotationMock).toHaveBeenCalledTimes(1)
    expect(saveAnnotationMock).toHaveBeenCalledWith(
      {
        annotationParts: [annotationPart],
        displayNumber: '2',
        selectedText: defaultTextToAnnotate
      },
      'New comment'
    )
  })

  it('popup field is empty when creating new annotation', async () => {
    const annotationAnchor_7_1 =
      'e:exam:0 > e:section:2 > e:question:7 > e:question:7.1 > e:question-title:0 > span:0 > #text:0'
    const exam = render(
      <Exam {...getExamProps()} annotations={[]} onClickAnnotation={() => {}} onSaveAnnotation={() => {}} />
    )
    await annotateText(exam, defaultAnnotationAnchor)
    const textbox = exam.getByTestId('edit-comment')
    fireEvent.input(textbox, {
      target: { innerText: 'New Value', innerHTML: 'New Value' }
    })
    await userEvent.click(exam.getByText('Tallenna'))
    // text picked by getMarkedText includes leading/trailing whitespace, so they must be here too
    await annotateText(exam, annotationAnchor_7_1)
    expect(exam.getByTestId('edit-comment').textContent).toHaveLength(0)
  })

  it('callback is called when annotation is clicked', async () => {
    const clickAnnotationMock = jest.fn()
    const exam = render(
      <Exam
        {...getExamProps()}
        annotations={createAnnotations([{ id: 1, startIndex: 5, selectedText: 'moraali että' }])}
        onClickAnnotation={clickAnnotationMock}
        onSaveAnnotation={() => {}}
      />
    )
    await userEvent.click(exam.container.querySelector('[data-annotation-id="1"]')!)

    const clickedAnnotation: RenderableAnnotation = {
      annotationAnchor: defaultAnnotationAnchor,
      annotationId: 1,
      hidden: false,
      length: 12,
      selectedText: 'moraali että',
      startIndex: 5,
      markNumber: 1
    }

    expect(clickAnnotationMock).toHaveBeenCalledTimes(1)
    expect(clickAnnotationMock).toHaveBeenCalledWith(expect.anything(), clickedAnnotation)
  })

  it('annotations are added to dom when provided', () => {
    const annotationProps: AnnotationProps = {
      annotations: createAnnotations([
        { id: 1, startIndex: 27, selectedText: 'pienempi' },
        { id: 3, startIndex: 166, selectedText: 'yhteisössä' }
      ]),
      onClickAnnotation: () => {},
      onSaveAnnotation: () => {}
    }
    const exam = render(<Exam {...getExamProps()} {...annotationProps} />)
    expect(exam.container.querySelector('[data-annotation-id="1"]')).toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="1"]')?.textContent).toBe('pienempi')
    expect(exam.container.querySelector('[data-annotation-id="1"] sup')).toHaveAttribute('data-content', '1')
    expect(exam.container.querySelector('[data-annotation-id="3"]')).toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="3"]')?.textContent).toBe('yhteisössä')
    expect(exam.container.querySelector('[data-annotation-id="3"] sup')).toHaveAttribute('data-content', '2')
  })

  it('"August 2024" annotations are added to dom when provided', () => {
    /** the difference of startIndex between an "August 2024 annotation" and a normal annotation
     * (in this case, but the index varies depending on the exam content)
     */
    const startIndexDifference = 24
    const annotationProps: AnnotationProps = {
      annotations: createAnnotations([{ id: 1, startIndex: 166 - startIndexDifference, selectedText: 'yhteisössä' }]),
      onClickAnnotation: () => {},
      onSaveAnnotation: () => {}
    }
    const exam = render(<Exam {...getExamProps()} {...annotationProps} />)
    expect(exam.container.querySelector('[data-annotation-id="1"]')).toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="1"]')?.textContent).toBe('yhteisössä')
    expect(exam.container.querySelector('[data-annotation-id="1"] sup')).toHaveAttribute('data-content', '1')
  })

  it('if two annotations have same id, only latter renders <sup>', () => {
    const annotationProps: AnnotationProps = {
      annotations: createAnnotations([
        { id: 1, startIndex: 71, selectedText: 'jokin' },
        { id: 1, startIndex: 77, selectedText: 'koulu' },
        { id: 2, startIndex: 142, selectedText: 'mikä' },
        { id: 2, startIndex: 147, selectedText: 'ero' }
      ]),
      onClickAnnotation: () => {},
      onSaveAnnotation: () => {}
    }

    const exam = render(<Exam {...getExamProps()} {...annotationProps} />)
    const marks = (id: string) => exam.container.querySelectorAll(`.e-annotation[data-annotation-id="${id}"]`)
    const marksId1 = marks('1')
    const marksId2 = marks('2')
    expect(marksId1[0].textContent).toBe('jokin')
    expect(marksId1[0].querySelector('sup')).not.toBeInTheDocument()
    expect(marksId1[1].textContent).toBe('koulu')
    expect(marksId1[1]).toBeInTheDocument()
    expect(marksId1[1].querySelector('sup')).toHaveAttribute('data-content', '1')

    expect(marksId2[0].textContent).toBe('mikä')
    expect(marksId2[0].querySelector('sup')).not.toBeInTheDocument()
    expect(marksId2[1].textContent).toBe('ero')
    expect(marksId2[1]).toBeInTheDocument()
    expect(marksId2[1].querySelector('sup')).toHaveAttribute('data-content', '2')
  })

  it('hidden annotation works correctly', () => {
    const annotations = createAnnotations([{ id: 1, startIndex: 59, selectedText: 'esimerkiksi', hidden: true }])
    const annotationProps: AnnotationProps = {
      annotations,
      onClickAnnotation: () => {},
      onSaveAnnotation: () => {}
    }
    const exam = render(<Exam {...getExamProps()} {...annotationProps} />)
    expect(exam.container.querySelector('[data-annotation-id="1"]')).toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="1"] sup')).not.toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="1"]')?.parentElement?.textContent).toBe(
      defaultTextToAnnotate
    )
  })

  it('annotations can not overlap — overlapping annotations are not rendered', () => {
    const annotations = createAnnotations([
      { id: 1, startIndex: 59, selectedText: 'esimerkiksi' },
      { id: 2, startIndex: 62, selectedText: 'merkiksi jo' },
      { id: 3, startIndex: 65, selectedText: 'kiksi jokin' },
      { id: 4, startIndex: 71, selectedText: 'jokin koulu' } // does NOT overlap with the first annotation
    ])
    const annotationProps: AnnotationProps = {
      annotations,
      onClickAnnotation: () => {},
      onSaveAnnotation: () => {}
    }
    const exam = render(<Exam {...getExamProps()} {...annotationProps} />)
    expect(exam.container.querySelector('[data-annotation-id="1"]')).toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="1"] sup')).toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="1"]')?.textContent).toBe('esimerkiksi')

    expect(exam.container.querySelector('[data-annotation-id="2"]')).toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="2"] sup')).not.toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="2"]')?.textContent).toBe('')

    expect(exam.container.querySelector('[data-annotation-id="3"]')).toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="3"] sup')).not.toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="2"]')?.textContent).toBe('')

    expect(exam.container.querySelector('[data-annotation-id="4"]')).toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="4"]')).toBeInTheDocument()
    expect(exam.container.querySelector('[data-annotation-id="4"]')?.textContent).toBe('jokin koulu')
  })

  it('grading instructions can be annotated', async () => {
    const gi = render(
      <GradingInstructions
        {...getCommonProps()}
        annotations={[]}
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
      <Attachments {...getCommonProps()} annotations={[]} onClickAnnotation={() => {}} onSaveAnnotation={() => {}} />
    )
    await annotateText(gi, annotationAnchor_7_A)
    expect(gi.getByTestId('annotation-popup')).toBeVisible()
  })

  function createAnnotations(annotations: Annotation[]): ExamAnnotation[] {
    const annotationsById = groupBy(annotations, 'id')
    return Object.keys(annotationsById).map((id, index) => {
      const annotationParts = annotationsById[id]
      return {
        annotationId: Number(id),
        selectedText: annotations.map(a => a.selectedText).join(' '),
        type: 'text',
        displayNumber: '2',
        hidden: annotationParts.some(a => a.hidden),
        markNumber: index + 1,
        annotationParts: annotationParts.map(p => ({
          startIndex: p.startIndex,
          length: p.selectedText.length,
          annotationAnchor: defaultAnnotationAnchor,
          selectedText: p.selectedText,
          annotationId: Number(id)
        }))
      }
    })
  }

  type Annotation = { id: number; startIndex: number; selectedText: string; hidden?: boolean }

  async function annotateText(exam: RenderResult, elementAnchor: string) {
    const textElement = exam.getByTestId(elementAnchor)
    const fullText = textElement?.textContent || ''
    const annotationLength = fullText.length
    const text = fullText.substring(0, annotationLength)
    mockWindowSelection(text, textElement, annotationLength)
    await userEvent.click(textElement)
  }

  function mockWindowSelection(text = 'mocked selection text', element: Element, length: number) {
    ;(window.getSelection as jest.Mock).mockImplementation(() => ({
      toString: () => text,
      rangeCount: 1,
      anchorNode: element.firstChild,
      focusNode: element.firstChild,
      getRangeAt: jest.fn().mockReturnValue({
        startOffset: 0,
        endOffset: length,
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
