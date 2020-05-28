const currentBranch = require('ci-env').branch

module.exports = {
  ci: {
    trackBranches: [currentBranch],
  },
  defaultCompression: 'none',
  files: [
    {
      path: 'packages/core/dist/main-bundle.js',
      maxSize: '955KB',
    },
    {
      path: 'packages/core/dist/main.css',
      maxSize: '45KB',
    },
  ],
}
