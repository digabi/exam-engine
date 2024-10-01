import React from 'react'

export function CurrentLocalization({ currentElement }: { currentElement: Element | null }) {
  const locale = currentElement?.getAttribute('lang')
  const lang = locale?.split('-')[0]?.toUpperCase()
  const examType = currentElement?.getAttribute('exam-type')
  return (
    <span className="element-target">
      <span>Kohdennus:</span>
      <span className="enabled">{lang ? `${lang} yleinen` : 'Yleinen'}</span>
      <span className={examType == 'hearing-impaired' ? 'enabled' : 'disabled'}>{lang} / KV</span>
      <span className={examType == 'visually-impaired' ? 'enabled' : 'disabled'}>{lang} / NV</span>
    </span>
  )
}
