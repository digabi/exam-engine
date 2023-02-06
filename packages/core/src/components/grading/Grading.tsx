import React, { useContext, useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { changeLanguage, initI18n } from '../../i18n'
import { useCached } from '../../useCached'
import { withCommonExamContext } from '../context/CommonExamContext'
import { CommonExamProps } from '../exam/Exam'
import { ResultsContext, withResultsContext } from '../context/ResultsContext'
import { MultiLineAnswer } from '../results/MultiLineAnswer'
import SingleLineAnswer from '../results/SingleLineAnswer'
import { QuestionContext } from '../context/QuestionContext'

const Results: React.FunctionComponent<CommonExamProps> = () => {
  const { answersByQuestionId } = useContext(ResultsContext)
  const { answers } = useContext(QuestionContext)

  const i18n = useCached(() => initI18n('FI-fi'))
  useEffect(changeLanguage(i18n, 'FI-fi'))

  const answerIds = Object.keys(answersByQuestionId).map(Number)
  const [answerId, setAnswerId] = useState<number>(answerIds[0])

  const { questionId, type, value, displayNumber } = answersByQuestionId[answerId]
  function selectQuestion(id: number) {
    setAnswerId(id)
  }
  return (
    <I18nextProvider i18n={i18n}>
      <main className="e-exam">
        <div>
          {answerIds.map((id) => (
            <button onClick={() => selectQuestion(id)} key={id}>
              {id}
            </button>
          ))}
        </div>

        <div>
          Tehtävä {displayNumber} ({questionId})
        </div>
        {type === 'richText' ? (
          <MultiLineAnswer {...{ type: 'rich-text', value }} />
        ) : (
          <SingleLineAnswer {...{ value, answers }}>
            <div></div>
          </SingleLineAnswer>
        )}
      </main>
    </I18nextProvider>
  )
}

export default React.memo(withResultsContext(withCommonExamContext(Results)))
