import {
  GenerateChoiceAnswerOptions,
  GenerateDropdownAnswerOptions,
  GenerateScoredTextAnswerOptions,
  GenerateTextAnswerOptions,
} from './generateExam'

export function textAnswer(options?: Partial<GenerateTextAnswerOptions>): GenerateTextAnswerOptions {
  return {
    name: 'text-answer',
    maxScore: 6,
    type: 'rich-text',
    ...options,
  }
}

export function scoredTextAnswer(options?: Partial<GenerateScoredTextAnswerOptions>): GenerateScoredTextAnswerOptions {
  return {
    name: 'scored-text-answer',
    hint: 'Vihje',
    acceptedAnswers: [
      {
        text: 'Oikea vaihtoehto',
        score: 3,
      },
    ],
    ...options,
  }
}

export function choiceAnswer(options?: Partial<GenerateChoiceAnswerOptions>): GenerateChoiceAnswerOptions {
  return {
    name: 'choice-answer',
    options: [
      {
        text: 'Oikea vaihtoehto',
        score: 3,
      },
      {
        text: 'Väärä vaihtoehto',
        score: 0,
      },
      {
        text: 'Väärä vaihtoehto',
        score: 0,
      },
    ],
    ...options,
  }
}

export function dropdownAnswer(options?: Partial<GenerateDropdownAnswerOptions>): GenerateDropdownAnswerOptions {
  return {
    name: 'dropdown-answer',
    options: [
      {
        text: 'Oikea vaihtoehto',
        score: 3,
      },
      {
        text: 'Väärä vaihtoehto',
        score: 0,
      },
      {
        text: 'Väärä vaihtoehto',
        score: 0,
      },
    ],
    ...options,
  }
}
