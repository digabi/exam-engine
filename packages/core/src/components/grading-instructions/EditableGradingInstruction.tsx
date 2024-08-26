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
      const xpath = answerGradingInstructionDiv.current.getAttribute('data-xpath')
      makeRichText(
        answerGradingInstructionDiv.current,
        {
          locale: language.startsWith('sv') ? 'SV' : 'FI',
          screenshotSaver: saveScreenshot ? ({ type, data }) => saveScreenshot(type, data, displayNumber) : undefined,
          screenshotImageSelector: 'img[src^="data:image/png"], img[src^="data:image/jpeg"]',
          fileTypes: ['image/png', 'image/jpeg']
        },
        ({ answerHTML }) => (onContentChange ? onContentChange(answerHTML, xpath) : () => {})
      )
      answerGradingInstructionDiv.current.replaceChildren(element)
    }
  }, [language])
  return <div ref={answerGradingInstructionDiv} data-xpath={xpathOf(element, language)} />
}

function indexOf(element: Element) {
  if (element.parentElement) {
    const siblings = Array.from(
      element.parentElement.querySelectorAll(`${element.parentElement.localName} > ${element.localName}`)
    )
    const index = siblings.findIndex(s => s == element)
    return `[${index + 1}]`
  }
  return ''
}

function xpathOf(element: Element, language: string): string {
  const index = indexOf(element)
  if (element.parentElement) {
    const localization = element.nodeName.includes('grading-instruction') ? `/e:localization[@lang="${language}"]` : ''
    return `${xpathOf(element.parentElement, language)}/${element.nodeName}${index}${localization}`
  }
  return `/${element.nodeName}${index}`
}
