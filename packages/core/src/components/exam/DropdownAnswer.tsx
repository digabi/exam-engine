import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import { useSelect } from 'downshift'
import * as _ from 'lodash-es'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { findChildElement, getNumericAttribute, mapChildElements, NBSP } from '../../dom-utils'
import * as fonts from '../../fonts'
import { useExamTranslation } from '../../i18n'
import { answerScoreId } from '../../ids'
import { ChoiceAnswer as ChoiceAnswerT } from '../../types/ExamAnswer'
import { QuestionContext } from '../context/QuestionContext'
import { Score } from '../shared/Score'
import { saveAnswer } from '../../store/answers/actions'
import { AnswersState } from '../../store/answers/reducer'
import { AnnotationContext } from '../context/AnnotationProvider'

const menuBorderWidthPx = 2
const roundingErrorCompensationPx = 1
const noAnswer = ''
const runningInBrowser = !navigator.userAgent.includes('jsdom/')

type Item = Element | typeof noAnswer

const DropdownAnswer: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const questionId = getNumericAttribute(element, 'question-id')!
  const maxScore = getNumericAttribute(element, 'max-score')!

  const answer = useSelector(
    (state: { answers: AnswersState }) => state.answers.answersById[questionId] as ChoiceAnswerT | undefined
  )
  const dispatch = useDispatch()
  const displayNumber = element.getAttribute('display-number')!
  const currentlySelectedItem =
    answer &&
    answer.value &&
    findChildElement(element, childElement => answer.value === childElement.getAttribute('option-id'))

  const labelRef = useRef<HTMLDivElement>(null)
  const menuRef = React.useRef<HTMLElement>(null)

  const [measuring, setMeasuring] = useState(true)
  const [fontsLoaded, setFontsLoaded] = useState(fonts.loaded)

  if (runningInBrowser) {
    // Force a re-measure if element changes or fonts are loaded after this
    // component has been rendered.
    fonts.ready.then(() => !fontsLoaded && setFontsLoaded(true)).catch(err => console.error(err))

    useEffect(() => setMeasuring(true), [element])

    useEffect(() => {
      if (measuring && menuRef.current && labelRef.current) {
        const menuEl = menuRef.current
        const labelEl = labelRef.current
        const preferredWidth = _.max(mapChildElements(menuEl, el => el.firstElementChild!.scrollWidth))!

        // Run the DOM mutations on the next frame to avoid layout trashing in exams with lots of dropdowns.
        const requestId = requestAnimationFrame(() => {
          labelEl.style.width = `${preferredWidth + menuBorderWidthPx + roundingErrorCompensationPx}px`
          setMeasuring(false)
        })
        return () => cancelAnimationFrame(requestId)
      }
    })
  }
  const items: Item[] = [noAnswer, ...element.children]
  const { answers, questionLabelIds } = useContext(QuestionContext)
  const { getItemProps, getMenuProps, getToggleButtonProps, highlightedIndex, isOpen, selectedItem } = useSelect({
    items,
    itemToString: item => (item ? item.textContent! : ''),
    onSelectedItemChange: ({ selectedItem }) => {
      const value = selectedItem ? selectedItem.getAttribute('option-id')! : ''
      dispatch(saveAnswer({ type: 'choice', questionId, value, displayNumber }))
    },
    initialSelectedItem: currentlySelectedItem
  })

  const { t } = useExamTranslation()
  const scoreId = answerScoreId(element)

  const annotationsEnabled = useContext(AnnotationContext)
  const mouseHandlerOverrides = {
    onClick: () => {},
    onMouseDown: () => {},
    onMouseMove: () => {}
  }

  return (
    <span className="e-nowrap">
      <span className="anchor" id={`question-nr-${displayNumber}`} />
      <span className={classNames('e-dropdown-answer e-normal')} data-question-id={questionId}>
        <button
          className={classNames('e-dropdown-answer__toggle-button e-button-plain e-columns', {
            'e-dropdown-answer__toggle-button--open': isOpen
          })}
          {...getToggleButtonProps(
            {
              'aria-describedby': scoreId,
              'aria-labelledby': questionLabelIds
            },
            { suppressRefError: !runningInBrowser }
          )}
        >
          <span className="e-dropdown-answer__label e-column e-pad-l-1 e-pad-r-4">
            <span className="e-ellipsis e-block" ref={labelRef}>
              {selectedItem ? (
                renderChildNodes(selectedItem)
              ) : (
                <span aria-label={t.raw('dropdown-answer.label')}>{NBSP}</span>
              )}
            </span>
          </span>
          <span
            className={classNames(
              'e-dropdown-answer__toggle-icon e-text-center e-column e-column--narrow e-column--gapless'
            )}
          >
            <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
          </span>
        </button>
        <span
          {...getMenuProps(
            {
              className: classNames('e-dropdown-answer__menu', { 'e-dropdown-answer__menu--open': isOpen }),
              'aria-labelledby': undefined,
              ref: menuRef
            },
            { suppressRefError: !runningInBrowser }
          )}
        >
          {items.map((item, i) => (
            <span
              className={classNames('e-dropdown-answer__menu-item e-block e-pad-l-1 e-pad-r-4', {
                'e-dropdown-answer__menu-item--selected': item === selectedItem,
                'e-bg-color-off-white': highlightedIndex !== i,
                'e-bg-color-link e-color-off-white': highlightedIndex === i
              })}
              key={i}
              {...getItemProps({
                item,
                index: i
              })}
              {...(annotationsEnabled ? mouseHandlerOverrides : {})}
            >
              {/* Use a wrapper element to exclude menu item padding when calculating the scroll width. */}
              <span className={classNames('e-dropdown-answer__menu-item-inner e-block', { 'e-nowrap': measuring })}>
                {item ? renderChildNodes(item) : <span aria-label={t.raw('dropdown-answer.clear')}>{NBSP}</span>}
              </span>
            </span>
          ))}
        </span>
      </span>
      {answers.length > 1 && <Score score={maxScore} size={'inline'} id={scoreId} />}
    </span>
  )
}

export default React.memo(DropdownAnswer)
