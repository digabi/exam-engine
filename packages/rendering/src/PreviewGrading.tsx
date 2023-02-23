import React, { useContext, useEffect, useRef, useState } from 'react'
import { ResultsContext, withResultsContext } from '@digabi/exam-engine-core/dist/components/context/ResultsContext'
import { Annotation } from '@digabi/exam-engine-core'
import { GradingAnswer } from '@digabi/exam-engine-core/dist/components/grading/GradingAnswer'
import { withCommonExamContext } from '@digabi/exam-engine-core/dist/components/context/CommonExamContext'

function PreviewGrading() {
  const { answersByQuestionId } = useContext(ResultsContext)
  const language = 'fi-FI'
  const answerIds = Object.keys(answersByQuestionId).map(Number)
  if (answerIds.length === 0) {
    return <div>No answers</div>
  }
  const [answerId, setAnswerId] = useState<number>(answerIds[0])

  const annotationsStorage = useRef<{ [k: string]: { pregrading: Annotation[]; censoring: Annotation[] } }>(
    Object.fromEntries(
      answerIds.map((id) => [
        id,
        {
          pregrading: [
            {
              startIndex: 2,
              length: 5,
              message: '+1',
            },
          ],
          censoring: [],
        },
      ])
    )
  )

  const [annotations, setAnnotations] = useState<{ pregrading: Annotation[]; censoring: Annotation[] }>({
    pregrading: [],
    censoring: [],
  })

  useEffect(() => {
    setAnnotations(annotationsStorage.current[answerId])
  })

  const answer = answersByQuestionId[answerId]
  const { type, value } = answer

  if (type === 'choice') {
    return <div>choice answer</div>
  }
  const { characterCount } = answer
  function selectQuestion(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: number) {
    e.preventDefault()
    setAnswerId(id)
    setAnnotations(annotationsStorage.current[id])
  }

  function saveAnnotations(annotations: { pregrading: Annotation[]; censoring: Annotation[] }) {
    annotationsStorage.current[answerId] = annotations
    setAnnotations({ ...annotationsStorage.current[answerId] })
  }

  return (
    <main className="e-exam">
      <div className="grading-navi">
        {answerIds.map((id) =>
          id === answerId ? (
            <span key={id} className="grading-navi-item">
              {answersByQuestionId[id].displayNumber}
            </span>
          ) : (
            <a className="grading-navi-item" href="" onClick={(e) => selectQuestion(e, id)} key={id}>
              {answersByQuestionId[id].displayNumber}
            </a>
          )
        )}
      </div>

      <GradingAnswer
        {...{
          answer: { type, characterCount, value },
          language,
          isReadOnly: false,
          gradingRole: 'censoring',
          maxLength: 100,
          annotations,
          saveAnnotations,
        }}
      />
    </main>
  )
}

export default withResultsContext(withCommonExamContext(PreviewGrading))
