import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import {
  GetPropsCommonOptions,
  useSelect,
  UseSelectGetMenuPropsOptions,
  UseSelectGetToggleButtonPropsOptions,
} from 'downshift'
import * as _ from 'lodash-es'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { findChildElement, getNumericAttribute, mapChildElements, NBSP } from '../dom-utils'
import * as fonts from '../fonts'
import { AppState } from '../store'
import * as actions from '../store/answers/actions'
import { QuestionContext } from './QuestionContext'
import { Score } from './Score'
import { ExamComponentProps } from '../createRenderChildNodes'
import { ChoiceAnswer as ChoiceAnswerT } from '../types/ExamAnswer'
import { useTranslation } from 'react-i18next'
import { answerScoreId } from '../ids'

interface DropdownAnswerProps extends ExamComponentProps {
  saveAnswer: typeof actions.saveAnswer
  answer?: ChoiceAnswerT
}

const menuBorderWidthPx = 2
const roundingErrorCompensationPx = 1
const noAnswer = ''
const runningInBrowser = !navigator.userAgent.includes('jsdom/')

type Item = Element | typeof noAnswer

function DropdownAnswer({ element, renderChildNodes, saveAnswer, answer }: DropdownAnswerProps) {
  const questionId = getNumericAttribute(element, 'question-id')!
  const maxScore = getNumericAttribute(element, 'max-score')!
  const displayNumber = element.getAttribute('display-number')!
  const currentlySelectedItem =
    answer &&
    answer.value &&
    findChildElement(element, (childElement) => answer.value === childElement.getAttribute('option-id'))

  const labelRef = useRef<HTMLDivElement>(null)
  const menuRef = React.useRef<HTMLElement>(null)

  const [measuring, setMeasuring] = useState(true)
  if (runningInBrowser) {
    // Force a re-measure if element changes or fonts are loaded after this
    // component has been rendered.
    const [, setFontsLoaded] = useState(fonts.loaded)
    fonts.ready.then(() => setFontsLoaded(true)).catch((err) => console.error(err))

    useEffect(() => setMeasuring(true), [element])

    useEffect(() => {
      if (measuring && menuRef.current && labelRef.current) {
        const menuEl = menuRef.current
        const labelEl = labelRef.current
        const preferredWidth = _.max(mapChildElements(menuEl, (el) => el.firstElementChild!.scrollWidth))!

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
  const { answers } = useContext(QuestionContext)
  const { getItemProps, getMenuProps, getToggleButtonProps, highlightedIndex, isOpen, selectedItem } = useSelect({
    items,
    itemToString: (item) => (item ? item.textContent! : ''),
    onSelectedItemChange: ({ selectedItem }) => {
      const value = selectedItem ? selectedItem.getAttribute('option-id')! : ''
      saveAnswer({ type: 'choice', questionId, value, displayNumber })
    },
    initialSelectedItem: currentlySelectedItem,
  })

  // Until the typings are fixed at https://github.com/downshift-js/downshift/pull/1123/files
  const getMenuPropsFixed: (
    options?: UseSelectGetMenuPropsOptions,
    extraOptions?: GetPropsCommonOptions
  ) => any = getMenuProps
  const getToggleButtonPropsFixed: (
    options?: UseSelectGetToggleButtonPropsOptions,
    extraOptions?: GetPropsCommonOptions
  ) => any = getToggleButtonProps

  const { t } = useTranslation()
  const scoreId = answerScoreId(element)

  return (
    <span className="e-nowrap">
      <span className={classNames('e-dropdown-answer e-normal')} data-question-id={questionId}>
        <button
          className={classNames('e-dropdown-answer__toggle-button e-button-plain e-columns', {
            'e-dropdown-answer__toggle-button--open': isOpen,
          })}
          {...getToggleButtonPropsFixed(
            {
              'aria-describedby': scoreId,
              // The label text is inside the button, so we don't want an aria-labelledby attribute.
              'aria-labelledby': undefined,
            },
            { suppressRefError: !runningInBrowser }
          )}
        >
          <span className="e-dropdown-answer__label e-column e-pad-l-1 e-pad-r-4">
            <span className="e-ellipsis e-block" ref={labelRef}>
              {selectedItem ? (
                renderChildNodes(selectedItem)
              ) : (
                <span aria-label={t('dropdown-answer.label')}>{NBSP}</span>
              )}
            </span>
          </span>
          <span
            className={classNames(
              'e-dropdown-answer__toggle-icon e-text-center e-column e-column--narrow e-column--gapless e-color-link'
            )}
          >
            <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
          </span>
        </button>
        <span
          {...getMenuPropsFixed(
            {
              className: classNames('e-dropdown-answer__menu', { 'e-dropdown-answer__menu--open': isOpen }),
              ref: menuRef,
            },
            { suppressRefError: !runningInBrowser }
          )}
        >
          {items.map((item, i) => (
            <span
              className={classNames('e-dropdown-answer__menu-item e-block e-pad-l-1 e-pad-r-4', {
                'e-dropdown-answer__menu-item--selected': item === selectedItem,
                'e-bg-color-off-white': highlightedIndex !== i,
                'e-bg-color-lighterblue': highlightedIndex === i,
              })}
              key={i}
              {...getItemProps({
                item,
                index: i,
              })}
            >
              {/* Use a wrapper element to exclude menu item padding when calculating the scroll width. */}
              <span className={classNames('e-dropdown-answer__menu-item-inner e-block', { 'e-nowrap': measuring })}>
                {item ? renderChildNodes(item) : <span aria-label={t('dropdown-answer.clear')}>{NBSP}</span>}
              </span>
            </span>
          ))}
        </span>
      </span>
      {answers.length > 1 && <Score score={maxScore} size={'inline'} id={scoreId} />}
    </span>
  )
}
function mapStateToprops(state: AppState, { element }: ExamComponentProps) {
  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = state.answers.answersById[questionId] as ChoiceAnswerT | undefined
  return { answer }
}

export default connect(mapStateToprops, {
  saveAnswer: actions.saveAnswer,
})(DropdownAnswer)
