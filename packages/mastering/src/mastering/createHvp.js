import R from 'ramda'
import { ns } from './schema'

/**
 * Generates HVP.
 *
 * @param {import("libxmljs2").Document} doc
 * @param {string} targetLanguage
 */
export const createHvp = (doc, targetLanguage) => {
  const cleanString = input => input.trim().replace(/\s+/g, ' ')
  const nodeContains = (elementName, node) => {
    return node.find(`.//${elementName}`, ns).length > 0
  }

  const findQuestionTypes = node => {
    const elementNamesToTypes = {
      'fi-FI': {
        'e:scored-text-answer': 'keskitetysti arvosteltava tekstivastaus',
        'e:choice-answer': 'monivalintavastaus',
        'e:dropdown-answer': 'aukkomonivalintavastaus',
        'e:text-answer': 'tekstivastaus'
      },
      'sv-FI': {
        'e:scored-text-answer': 'centraliserat bedömt textsvar',
        'e:dropdown-answer': 'flervalslucksvar',
        'e:choice-answer': 'flervalssvar',
        'e:text-answer': 'textsvar'
      }
    }

    const elementNamesToTypesInTargetLanguage = elementNamesToTypes[targetLanguage]

    return Object.keys(elementNamesToTypesInTargetLanguage)
      .map(elementName => (nodeContains(elementName, node) ? elementNamesToTypesInTargetLanguage[elementName] : null))
      .filter(x => x !== null)
  }

  const optionsWithScoresString = function(node, optionElementName) {
    return node
      .find(`.//${optionElementName}[@score]`, ns)
      .map(o => `\t\t${cleanString(o.text())} (${o.attr('score').value()} p.)`)
      .join(', ')
  }

  const getAttributeValue = attributeName => node => node.attr(attributeName).value()
  const getMaxScore = getAttributeValue('max-score')
  const getScore = getAttributeValue('score')
  const getDisplayNumber = getAttributeValue('display-number')

  const nodeToStrings = function(node) {
    switch (node.name()) {
      case 'exam-title':
        return [cleanString(node.text())]
      case 'section': {
        const sectionTitle = cleanString(node.find('e:section-title', ns)[0].text())
        return [
          `\n\n${targetLanguage === 'sv-FI' ? 'DEL' : 'OSA'} ${getDisplayNumber(node)}: ${sectionTitle} (${getMaxScore(
            node
          )} p.)`
        ]
      }
      case 'question': {
        const answerTypesInQuestion = findQuestionTypes(node)
        const questionTitle = cleanString(node.find('e:question-title', ns)[0].text())
        return [
          `\n\t${getDisplayNumber(node)}. ${questionTitle} (${getMaxScore(node)} p.) (${answerTypesInQuestion.join(
            ', '
          )})`
        ]
      }
      case 'choice-answer': {
        return [optionsWithScoresString(node, 'e:choice-answer-option')]
      }
      case 'scored-text-answer': {
        return [
          `\t${getDisplayNumber(node)}: ${node
            .find('.//e:accepted-answer[@score]', ns)
            .map(elem => `${cleanString(elem.text())} (${getScore(elem)} p.)`)
            .join(', ')}`
        ]
      }
      case 'dropdown-answer': {
        return [optionsWithScoresString(node, 'e:dropdown-answer-option')]
      }
      default:
        return []
    }
  }

  const processNode = node => {
    if (node.type() !== 'element') {
      return []
    }

    const childNodes = node.childNodes()
    return childNodes.length !== 0 ? [...nodeToStrings(node), ...childNodes.map(processNode)] : []
  }

  return R.flatten(doc.childNodes().map(processNode))
    .join('\n')
    .trim()
}
