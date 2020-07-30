export function formatQuestionDisplayNumber(displayNumber: string): string {
  return displayNumber.includes('.') ? displayNumber : displayNumber + '.'
}
