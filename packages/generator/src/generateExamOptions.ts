import {
  GenerateAnswerOptions,
  GenerateChoiceAnswerOptions,
  GenerateDNDAnswerOptions,
  GenerateDropdownAnswerOptions,
  GenerateQuestionOptions,
  GenerateScoredTextAnswerOptions,
  GenerateTextAnswerOptions,
  GenerateAudioAnswerOptions
} from './generateExam'

/**
 * A shorthand version of the function for creating a question containing the specified answers.
 *
 * @param answers An array of answers.
 * @example question([textAnswer()]) // Equivalent to question({ answers: [textAnswer()] })
 */
export function question(answers: GenerateAnswerOptions[]): GenerateQuestionOptions
/**
 * A shorthand version of the function for creating a question containing the specified child questions.
 *
 * @param questions An array of child questions.
 * @example question([question(…)]) // Equivalent to question({ questions: [question(…)] })
 */
export function question(questions: GenerateQuestionOptions[]): GenerateQuestionOptions
/**
 * Create a question.
 *
 * @param options An object describing the structure of the question.
 * @example question({ maxAnswers: 1, answers: [textAnswer(), textAnswer()] })
 */
export function question(options: GenerateQuestionOptions): GenerateQuestionOptions
export function question(
  args: GenerateQuestionOptions | GenerateAnswerOptions[] | GenerateQuestionOptions[]
): GenerateQuestionOptions {
  if (Array.isArray(args)) {
    if ('answers' in args[0] || 'questions' in args[0]) {
      return { questions: args as GenerateQuestionOptions[] }
    } else {
      return { answers: args as GenerateAnswerOptions[] }
    }
  } else {
    return args
  }
}

export function textAnswer(options?: Partial<GenerateTextAnswerOptions>): GenerateTextAnswerOptions {
  return {
    name: 'text-answer',
    maxScore: 6,
    type: 'rich-text',
    ...options
  }
}

export function scoredTextAnswer(options?: Partial<GenerateScoredTextAnswerOptions>): GenerateScoredTextAnswerOptions {
  return {
    name: 'scored-text-answer',
    hint: 'Vihje',
    acceptedAnswers: [
      {
        text: 'Oikea vaihtoehto',
        score: 3
      },
      // The legacy exam generator expects this to be the correct answer. (ノಠ益ಠ)ノ彡┻━┻
      {
        text: 'lol',
        score: 3
      }
    ],
    ...options
  }
}

export function choiceAnswer(options?: Partial<GenerateChoiceAnswerOptions>): GenerateChoiceAnswerOptions {
  return {
    name: 'choice-answer',
    options: [
      {
        text: 'Oikea vaihtoehto',
        score: 3
      },
      {
        text: 'Väärä vaihtoehto',
        score: 0
      },
      {
        text: 'Väärä vaihtoehto',
        score: 0
      }
    ],
    ...options
  }
}

export function dropdownAnswer(options?: Partial<GenerateDropdownAnswerOptions>): GenerateDropdownAnswerOptions {
  return {
    name: 'dropdown-answer',
    options: [
      {
        text: 'Oikea vaihtoehto',
        score: 3
      },
      {
        text: 'Väärä vaihtoehto',
        score: 0
      },
      {
        text: 'Väärä vaihtoehto',
        score: 0
      }
    ],
    ...options
  }
}
export function dndAnswer(options?: Partial<GenerateDNDAnswerOptions>): GenerateDNDAnswerOptions {
  return {
    name: 'dnd-answer',
    options: [
      {
        text: 'Answer 1',
        score: 3
      },
      {
        text: 'Wrong answer',
        score: 0
      }
    ],
    ...options
  }
}

export function audioAnswer(options?: Partial<GenerateAudioAnswerOptions>): GenerateAudioAnswerOptions {
  return {
    name: 'audio-answer',
    maxScore: 6,
    ...options
  }
}
