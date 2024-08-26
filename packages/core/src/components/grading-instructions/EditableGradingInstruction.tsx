import React, { useContext, useEffect, useRef } from 'react'
import { makeRichText } from 'rich-text-editor'
import { GradingInstructionContext } from '../context/GradingInstructionContext'
import { CommonExamContext } from '../context/CommonExamContext'
import { QuestionContext } from '../context/QuestionContext'

export function EditableGradingInstruction({ element }: { element: Element }) {
  const { language, examType } = useContext(CommonExamContext)
  const { displayNumber } = useContext(QuestionContext)
  const { onContentChange, saveScreenshot } = useContext(GradingInstructionContext)
  const answerGradingInstructionDiv = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (answerGradingInstructionDiv.current) {
      const path = element.getAttribute('path') ?? ''
      makeRichText(
        answerGradingInstructionDiv.current,
        {
          locale: language.startsWith('sv') ? 'SV' : 'FI',
          screenshotSaver: saveScreenshot ? ({ type, data }) => saveScreenshot(type, data, displayNumber) : undefined,
          screenshotImageSelector: 'img[src^="data:image/png"], img[src^="data:image/jpeg"]',
          fileTypes: ['image/png', 'image/jpeg']
        },
        ({ answerHTML }) => (onContentChange ? onContentChange(answerHTML, path) : () => {})
      )
      answerGradingInstructionDiv.current.replaceChildren(element)
    }
  }, [language, examType])
  return <div ref={answerGradingInstructionDiv} />
}
