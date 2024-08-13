import React, { useContext, useEffect, useRef, useState } from 'react'
import { ResultsContext, withResultsContext } from '@digabi/exam-engine-core/dist/components/context/ResultsContext'
import { Annotation } from '@digabi/exam-engine-core'
import { GradingAnswer } from '@digabi/exam-engine-core/dist/components/grading/GradingAnswer'
import { withCommonExamContext } from '@digabi/exam-engine-core/dist/components/context/CommonExamContext'

function PreviewGrading() {
  const { answersByQuestionId } = useContext(ResultsContext)
  const answerIds = Object.keys(answersByQuestionId).map(Number)
  if (answerIds.length === 0) {
    return <div>No answers</div>
  }
  const [answerId, setAnswerId] = useState<number>(answerIds[0])

  type Language = 'fi-FI' | 'sv-FI'
  const [language, setLanguage] = useState<Language>('fi-FI')
  const annotationsStorage = useRef<{ [k: string]: { pregrading: Annotation[]; censoring: Annotation[] } }>(
    Object.fromEntries(
      answerIds.map(id => [
        id,
        {
          pregrading: [
            {
              startIndex: 2,
              length: 5,
              message: '+1'
            }
          ],
          censoring: []
        }
      ])
    )
  )

  const [annotations, setAnnotations] = useState<{ pregrading: Annotation[]; censoring: Annotation[] }>({
    pregrading: [],
    censoring: []
  })

  useEffect(() => {
    setAnnotations(annotationsStorage.current[answerId])
  })

  const answer = answersByQuestionId[answerId]

  return (
    <main className="e-exam">
      <div className="grading-header">
        <div className="grading-navi">
          {answerIds.map(id =>
            id === answerId ? (
              <span key={id} className="grading-navi-item">
                {answersByQuestionId[id].displayNumber}
              </span>
            ) : (
              <a className="grading-navi-item" href="" onClick={e => selectQuestion(e, id)} key={id}>
                {answersByQuestionId[id].displayNumber}
              </a>
            )
          )}
        </div>
        <div className="language-settings">
          <a
            className="grading-navi-item"
            href=""
            onClick={e => {
              e.preventDefault()
              setLanguage('fi-FI')
            }}
          >
            FI
          </a>
          <a
            className="grading-navi-item"
            href=""
            onClick={e => {
              e.preventDefault()
              setLanguage('sv-FI')
            }}
          >
            SV
          </a>
        </div>
      </div>
      <div className="answer-and-scores">
        <div className="score-margin">Ei arvosteltu</div>
        {answer.type === 'choice' ? (
          <div>choice answer</div>
        ) : (
          <GradingAnswer
            {...{
              answer,
              language,
              isReadOnly: false,
              gradingRole: 'censoring',
              maxLength: 100,
              annotations,
              saveAnnotations,
              popupTopMargin: 0
            }}
          />
        )}
      </div>
    </main>
  )

  function selectQuestion(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: number) {
    e.preventDefault()
    setAnswerId(id)
    setAnnotations(annotationsStorage.current[id])
  }

  function saveAnnotations(annotations: { pregrading: Annotation[]; censoring: Annotation[] }) {
    annotationsStorage.current[answerId] = annotations
    setAnnotations({ ...annotationsStorage.current[answerId] })
  }
}

export default withResultsContext(withCommonExamContext(PreviewGrading))
