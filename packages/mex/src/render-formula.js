const mjAPI = require('mathjax-node')
const path = require('path')
const fs = require('fs')

const errorSvg = fs.readFileSync(path.resolve(__dirname, 'error.svg'))

mjAPI.config({
  extensions: 'TeX/mhchem.js',
  MathJax: {
    SVG: {
      font: 'Latin-Modern'
    }
  }
})

mjAPI.start()

async function renderFormula(formula, mode, lenient = false) {
  return mjAPI
    .typeset({
      math: formula,
      format: mode === 'display' ? 'TeX' : 'inline-TeX',
      mml: true,
      svg: true,
      ex: 9 // Noto Sans 16px
    })
    .catch(async errors => {
      if (lenient) {
        return { svg: errorSvg, mml: '' }
      } else {
        throw errors
      }
    })
}

module.exports = renderFormula
