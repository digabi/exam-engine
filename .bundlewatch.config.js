const currentBranch = require('ci-env').branch

module.exports = {
  ci: {
    trackBranches: [currentBranch],
  },
  files: [
    {
      path: 'packages/core/dist/main-bundle.js',
      maxSize: '262KB',
    },
    {
      path: 'packages/core/dist/main.css',
      maxSize: '9KB',
    },
  ],
}
