import _ from 'lodash'
import { test, expect } from '@playwright/experimental-ct-react'
import { Score } from '../../../src'
import React from 'react'
import { AnnotationListStory } from '../stories/AnnotationList.story'

const defaultScores: Score = {
  questionId: 1,
  answerId: 1,
  pregrading: {
    score: 1,
    annotations: [
      {
        startIndex: 0,
        length: 1,
        message: 'Test pregrading annotation'
      }
    ]
  },
  censoring: {
    scores: [
      { score: 4, shortCode: 'SE3' },
      { score: 3, shortCode: 'SE2' },
      { score: 2, shortCode: 'SE1' }
    ],
    annotations: [
      {
        startIndex: 0,
        length: 1,
        message: 'Test censoring annotation'
      }
    ]
  },
  inspection: { score: 5, shortCodes: ['IN1', 'IN2'] }
}

test.describe('<AnnotationList />', () => {
  test.describe('fi-FI', () => {
    test('renders empty without score', async ({ mount }) => {
      const resultsProps = {
        scores: []
      }
      const component = await mount(<AnnotationListStory results={resultsProps} />)
      expect(await component.innerHTML()).toBe('')
    })

    test('renders empty without annotations', async ({ mount }) => {
      const resultsProps = {
        scores: [_.pick(defaultScores, 'answerId', 'questionId')]
      }
      const component = await mount(<AnnotationListStory results={resultsProps} />)
      expect(await component.innerHTML()).toBe('')
    })

    test('renders with only pregrading annotations', async ({ mount }) => {
      const resultsProps = {
        scores: [_.pick(defaultScores, 'pregrading', 'answerId', 'questionId')]
      }
      const component = await mount(<AnnotationListStory results={resultsProps} />)
      expect(await component.innerHTML()).toBe(
        normalize(`<div class="e-column e-column--6">
            <h5>Alustavan arvostelun merkinnät (opettaja)</h5>
            <ol class="e-list-data e-pad-l-0 e-font-size-s">
                <li data-list-number="1)">Test pregrading annotation</li>
            </ol>
         </div>
         <div class="e-column e-column--6">
            <h5>Sensorin merkinnät</h5>
            <ol class="e-list-data e-pad-l-0 e-font-size-s"></ol>
         </div>`)
      )
    })

    test('filters empty annotations', async ({ mount }) => {
      const resultsProps = {
        scores: [
          {
            ..._.pick(defaultScores, 'pregrading', 'answerId', 'questionId'),
            ...{
              pregrading: {
                score: 1,
                annotations: [
                  {
                    startIndex: 0,
                    length: 1,
                    message: 'Before empty annotation'
                  },
                  {
                    startIndex: 1,
                    length: 1,
                    message: ''
                  },
                  {
                    startIndex: 2,
                    length: 1,
                    message: 'After empty annotation'
                  }
                ]
              }
            }
          }
        ]
      }
      const component = await mount(<AnnotationListStory results={resultsProps} />)
      expect(await component.innerHTML()).toBe(
        normalize(`<div class="e-column e-column--6">
            <h5>Alustavan arvostelun merkinnät (opettaja)</h5>
            <ol class="e-list-data e-pad-l-0 e-font-size-s">
                <li data-list-number="1)">Before empty annotation</li>
                <li data-list-number="2)">After empty annotation</li>
            </ol>
         </div>
         <div class="e-column e-column--6">
            <h5>Sensorin merkinnät</h5>
            <ol class="e-list-data e-pad-l-0 e-font-size-s"></ol>
         </div>`)
      )
    })

    test('renders with only censoring annotations', async ({ mount }) => {
      const resultsProps = {
        scores: [_.pick(defaultScores, 'censoring', 'answerId', 'questionId')]
      }
      const component = await mount(<AnnotationListStory results={resultsProps} />)
      expect(await component.innerHTML()).toBe(
        normalize(`<div class="e-column e-column--6">
            <h5>Alustavan arvostelun merkinnät (opettaja)</h5>
            <ol class="e-list-data e-pad-l-0 e-font-size-s"></ol>
         </div>
         <div class="e-column e-column--6">
            <h5>Sensorin merkinnät</h5>
            <ol class="e-list-data e-pad-l-0 e-font-size-s">
                <li data-list-number="1)">Test censoring annotation</li>
            </ol>
         </div>`)
      )
    })

    test('renders with pregrading and censoring annotations', async ({ mount }) => {
      const resultsProps = {
        scores: [defaultScores]
      }
      const component = await mount(<AnnotationListStory results={resultsProps} />)
      expect(await component.innerHTML()).toBe(
        normalize(`<div class="e-column e-column--6">
            <h5>Alustavan arvostelun merkinnät (opettaja)</h5>
            <ol class="e-list-data e-pad-l-0 e-font-size-s">
                <li data-list-number="1)">Test pregrading annotation</li>
            </ol>
         </div>
         <div class="e-column e-column--6">
            <h5>Sensorin merkinnät</h5>
            <ol class="e-list-data e-pad-l-0 e-font-size-s">
                <li data-list-number="2)">Test censoring annotation</li>
            </ol>
         </div>`)
      )
    })

    test('renders only pregrading without header on singleGrading in ResultContext', async ({ mount }) => {
      const resultsProps = {
        scores: [defaultScores],
        singleGrading: true
      }
      const component = await mount(<AnnotationListStory results={resultsProps} />)
      expect(await component.innerHTML()).toBe(
        normalize(`<div class="e-column e-column--10">
            <ol class="e-list-data e-pad-l-0 e-font-size-s">
                <li data-list-number="1)">Test pregrading annotation</li>
            </ol>
          </div>`)
      )
    })

    test('renders null if no scores and singleGrading in ResultContext', async ({ mount }) => {
      const resultsProps = {
        scores: [],
        singleGrading: true
      }
      const component = await mount(<AnnotationListStory results={resultsProps} />)
      expect(await component.innerHTML()).toBe('')
    })
  })

  test.describe('sv-FI', () => {
    test('renders with pregrading and censoring annotations', async ({ mount }) => {
      const resultsProps = {
        scores: [defaultScores]
      }
      const component = await mount(<AnnotationListStory results={resultsProps} lang="sv-FI" />)
      expect(await component.innerHTML()).toBe(
        normalize(`<div class="e-column e-column--6">
            <h5>Preliminära bedömningens anteckningar (lärare)</h5>
            <ol class="e-list-data e-pad-l-0 e-font-size-s">
                <li data-list-number="1)">Test pregrading annotation</li>
            </ol></div><div class="e-column e-column--6">
            <h5>Censorns anteckningar</h5>
            <ol class="e-list-data e-pad-l-0 e-font-size-s">
                <li data-list-number="2)">Test censoring annotation</li>
            </ol>
        </div>`)
      )
    })
  })

  function normalize(html: string) {
    return html.replace(/>\s+</g, '><').trim()
  }
})
