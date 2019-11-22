export default function parseExam(examXml: string, deterministicRendering: boolean = false): XMLDocument {
  const doc = new DOMParser().parseFromString(examXml, 'application/xml')
  if (!deterministicRendering) {
    Array.from(doc.querySelectorAll('choice-answer, dropdown-answer'))
      .filter(e => e.getAttribute('ordering') !== 'fixed')
      .forEach(e => randomizeChildElementOrder(e))
  }
  return doc
}

const randomizeChildElementOrder = (elem: Element) => {
  for (let i = elem.children.length; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    elem.appendChild(elem.children[j])
  }
}
