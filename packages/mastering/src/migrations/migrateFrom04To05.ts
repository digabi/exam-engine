import { Document, Element } from 'libxmljs2'
import { ns } from '../mastering/schema'

/**
 * Migrates an exam from schema version 0.4 to 0.5
 *
 * Combine multiple cas-forbidden sections into one section (only a single cas forbidden section is allowed)
 */
export function migrateFrom04To05(doc: Document) {
  const casForbiddenSections = doc
    .find<Element>('./e:section', ns)
    .filter(section => section.attr('cas-forbidden')?.value() == 'true')
  if (casForbiddenSections.length == 0) {
    return // no cas-forbidden sections
  }
  const firstSection = doc.find('./e:section', ns)?.at(0) as Element
  const isFirstSectionCasForbidden = firstSection.attr('cas-forbidden')?.value() == 'true'
  if (casForbiddenSections.length == 1 && isFirstSectionCasForbidden) {
    return // only the first section is cas-forbidden
  }

  const firstCasForbiddenSection = casForbiddenSections[0]
  let firstCasForbiddenSectionInstruction = firstCasForbiddenSection.get<Element>('./e:section-instruction', ns)
  if (!firstCasForbiddenSectionInstruction) {
    firstCasForbiddenSectionInstruction = new Element(doc, 'e:section-instruction')
    firstCasForbiddenSection.addChild(firstCasForbiddenSectionInstruction)
  }

  // merge section-instruction and questions from other cas-forbidden sections into first
  for (const section of casForbiddenSections.slice(1)) {
    const sectionInstruction = section.get<Element>('./e:section-instruction', ns)?.childNodes()
    if (sectionInstruction) {
      for (const child of sectionInstruction) {
        firstCasForbiddenSectionInstruction.addChild(child)
      }
    }
    const questions = section.find('./e:question', ns)
    for (const question of questions) {
      firstCasForbiddenSection.addChild(question)
    }
    section.remove()
  }

  // Move cas-forbidden section to be first section if that's not the case
  if (!isFirstSectionCasForbidden) {
    firstSection.addPrevSibling(firstCasForbiddenSection)
  }
}
