const currentBranch = require('ci-env').branch

module.exports = {
  ci: {
    trackBranches: [currentBranch],
  },
  files: [
    {
      path: 'packages/core/dist/main-bundle.js',
      maxSize: '235KB',
    },
    {
      path: 'packages/core/dist/main.css',
      maxSize: '12KB',
    },
  ],
}
