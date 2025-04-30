import classNames from 'classnames'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ExamComponentProps } from '../../../createRenderChildNodes'
import { getAttribute, getBooleanAttribute, getNumericAttribute } from '../../../dom-utils'
import { RichTextAnswer as RichTextAnswerT, TextAnswer as TextAnswerT } from '../../../types/ExamAnswer'
import AnswerToolbar from '../../AnswerToolbar'
import { ExamContext } from '../../context/ExamContext'
import { QuestionContext } from '../../context/QuestionContext'
import RichTextAnswer, { ScreenshotError } from '../RichTextAnswer'
import { Score } from '../../shared/Score'
import { answerLengthInfoId, answerScoreId } from '../../../ids'
import { AnswerTooLong } from '../../../validateAnswers'
import AnswerLengthInfo from '../../shared/AnswerLengthInfo'
import { CommonExamContext } from '../../context/CommonExamContext'
import { answerBlurred, answerFocused, saveAnswer, selectAnswerVersion } from '../../../store/answers/actions'
import { AnswersState } from '../../../store/answers/reducer'

const borderWidthPx = 2

const TextAnswerInput: React.FunctionComponent<ExamComponentProps> = ({ element, className }) => {
  const type = getAttribute(element, 'type')!
  const questionId = getNumericAttribute(element, 'question-id')!
  const displayNumber = getAttribute(element, 'display-number')!
  const maxScore = getNumericAttribute(element, 'max-score')!
  const useLanguageOfInstruction = getBooleanAttribute(element, 'use-language-of-instruction')
  const maxLength = getNumericAttribute(element, 'max-length')

  const { language } = useContext(CommonExamContext)
  const { questionLabelIds, answers } = useContext(QuestionContext)
  const { examServerApi } = useContext(ExamContext)

  const [screenshotError, setScreenshotError] = useState<ScreenshotError>()
  const answer = useSelector(
    (state: { answers: AnswersState }) =>
      state.answers.answersById[questionId] as TextAnswerT | RichTextAnswerT | undefined
  )

  const supportsAnswerHistory = useSelector((state: { answers: AnswersState }) => state.answers.supportsAnswerHistory)

  const showAnswerHistory = useSelector(
    (state: { answers: AnswersState }) =>
      state.answers.supportsAnswerHistory && state.answers.serverQuestionIds.has(questionId)
  )

  const validationError = useSelector((state: { answers: AnswersState }) =>
    state.answers.validationErrors.find(
      (error): error is AnswerTooLong => error.type === 'AnswerTooLong' && error.displayNumber === displayNumber
    )
  )

  const dispatch = useDispatch()
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  const value = answer && answer.value
  const scoreId = answerScoreId(element)
  const invalid = validationError != null
  const lang = useLanguageOfInstruction ? language : undefined
  const labelledBy = element.hasAttribute('max-length')
    ? `${questionLabelIds} ${answerLengthInfoId(element)}`
    : questionLabelIds

  useEffect(() => {
    const { current } = ref

    if (current) {
      if (type === 'single-line' || type === 'integer') {
        current.style.width = '0'
        current.style.width = `${current.scrollWidth + borderWidthPx}px`
      }
    }
  })

  const onChange = useCallback<React.ChangeEventHandler<HTMLTextAreaElement & HTMLInputElement>>(
    event => {
      const value = event.currentTarget.value.trim()
      const answer: TextAnswerT = {
        type: 'text',
        questionId,
        value,
        characterCount: getCharacterCount(value),
        displayNumber
      }
      dispatch(saveAnswer(answer))
      setScreenshotError(undefined)
    },
    [questionId, displayNumber]
  )
  const [integerValue, setIntegerValue] = useState<string>(answer?.value || '')

  const onIntegerChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    event => {
      event.preventDefault()
      event.currentTarget.classList.remove('text-answer--integer--input-error')
      const patternForIntegers = /^(\u002D|\u2212)?\d*$/
      const value = event.currentTarget.value.trim()
      if (patternForIntegers.test(value)) {
        setIntegerValue(value)
        const answer: TextAnswerT = {
          type: 'text',
          questionId,
          value,
          characterCount: getCharacterCount(value),
          displayNumber
        }
        dispatch(saveAnswer(answer))
        setScreenshotError(undefined)
      } else {
        event.currentTarget.classList.add('text-answer--integer--input-error')
        setTimeout(
          (target: HTMLInputElement) => {
            target.classList.remove('text-answer--integer--input-error')
          },
          200,
          event.currentTarget
        )
      }
    },
    [questionId, displayNumber]
  )

  const onRichTextChange = useCallback(
    (answerHtml: string, answerText: string) => {
      const answer: RichTextAnswerT = {
        type: 'richText',
        questionId,
        value: answerHtml,
        characterCount: getCharacterCount(answerText),
        displayNumber
      }
      dispatch(saveAnswer(answer))
      setScreenshotError(undefined)
    },
    [questionId, displayNumber]
  )

  const onError = useCallback(
    (screenshotError: ScreenshotError) => setScreenshotError(screenshotError),
    [screenshotError]
  )
  const onFocus = useCallback(() => dispatch(answerFocused(questionId)), [questionId])
  const onBlur = useCallback(() => dispatch(answerBlurred(questionId)), [questionId])
  const wrappedSelectAnswerVersion = useCallback<typeof selectAnswerVersion>(
    (questionId, questionText) => dispatch(selectAnswerVersion(questionId, questionText)),
    []
  )

  switch (type) {
    case 'rich-text':
      return (
        <>
          {maxLength != null && <AnswerLengthInfo {...{ maxLength, id: answerLengthInfoId(element) }} />}
          <div className="text-answer-container">
            <RichTextAnswer
              answer={answer as RichTextAnswerT}
              className={classNames('text-answer text-answer--rich-text', className)}
              saveScreenshot={data => examServerApi.saveScreenshot(questionId, data)}
              onChange={onRichTextChange}
              onError={onError}
              questionId={questionId}
              lang={lang}
              invalid={invalid}
              labelledBy={labelledBy}
            />
            <AnswerToolbar
              {...{
                answer,
                element,
                selectAnswerVersion: wrappedSelectAnswerVersion,
                showAnswerHistory,
                supportsAnswerHistory,
                screenshotError,
                validationError
              }}
            />
          </div>
        </>
      )
    case 'integer':
      return (
        <span className="e-nowrap">
          <input
            type="text"
            className={classNames('text-answer text-answer--single-line text-answer--integer', className)}
            value={integerValue}
            onChange={onIntegerChange}
            onFocus={onFocus}
            onBlur={onBlur}
            ref={ref}
            data-question-id={questionId}
            lang={lang}
            aria-describedby={scoreId}
            aria-labelledby={labelledBy}
          />
          {answers.length > 1 && <Score score={maxScore} size="inline" id={scoreId} />}
        </span>
      )
    case 'single-line':
    default:
      return (
        <span className="e-nowrap">
          <input
            type="text"
            className={classNames('text-answer text-answer--single-line', className)}
            defaultValue={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            ref={ref}
            data-question-id={questionId}
            lang={lang}
            aria-describedby={scoreId}
            aria-labelledby={labelledBy}
          />
          {answers.length > 1 && <Score score={maxScore} size="inline" id={scoreId} />}
        </span>
      )
  }
}

export function getCharacterCount(answerText: string): number {
  return answerText.replace(/\s/g, '').length
}

export default React.memo(TextAnswerInput)
