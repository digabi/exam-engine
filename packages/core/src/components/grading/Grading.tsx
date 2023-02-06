import React, { useContext, useEffect } from 'react'
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

  return (
    <I18nextProvider i18n={i18n}>
      <main className="e-exam">
        {Object.values(answersByQuestionId).map(({ questionId, type, value, displayNumber }) => (
          <div key={questionId}>
            <div>
              {displayNumber} ({questionId})
            </div>
            {type === 'richText' ? (
              <MultiLineAnswer {...{ key: questionId, type: 'rich-text', value }} />
            ) : (
              <SingleLineAnswer {...{ key: questionId, value, answers }}>
                <div></div>
              </SingleLineAnswer>
            )}
          </div>
        ))}
      </main>
    </I18nextProvider>
  )
}

export default React.memo(withResultsContext(withCommonExamContext(Results)))
