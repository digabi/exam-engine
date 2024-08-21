import React, { useContext, useEffect, useRef } from 'react'
import { makeRichText } from 'rich-text-editor'
import { GradingInstructionContext } from '../context/GradingInstructionContext'
import { CommonExamContext } from '../context/CommonExamContext'
import { QuestionContext } from '../context/QuestionContext'

export function EditableGradingInstruction({ element }: { element: Element }) {
  const { language } = useContext(CommonExamContext)
  const { displayNumber } = useContext(QuestionContext)
  const { onContentChange, saveScreenshot } = useContext(GradingInstructionContext)
  const answerGradingInstructionDiv = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (answerGradingInstructionDiv.current) {
      makeRichText(
        answerGradingInstructionDiv.current,
        {
          locale: language.startsWith('sv') ? 'SV' : 'FI',
          screenshotSaver: saveScreenshot ? ({ type, data }) => saveScreenshot(type, data, displayNumber) : undefined,
          forceInit: true,
          screenshotImageSelector: 'img[src^="data:image/png"], img[src^="data:image/jpeg"]',
          fileTypes: ['image/png', 'image/jpeg']
        },
        ({ answerHTML }) => (onContentChange ? onContentChange(answerHTML, displayNumber) : () => {})
      )
      answerGradingInstructionDiv.current.replaceChildren(element)
    }
  }, [language])
  return <div ref={answerGradingInstructionDiv} />
}
