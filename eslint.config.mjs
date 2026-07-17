import digabiConfig from '@digabi/eslint-config'
import globals from 'globals'

export default [
  {
    ignores: [
      'packages/*/dist',
      '**/node_modules',
      '**/main-bundle.js',
      '**/.cache/',
      'packages/*/__tests__/__snapshots__',
      'packages/*/__tests__/results/__snapshots__'
    ]
  },
  ...digabiConfig(),
  {
    files: ['**/jest.setup.js'],
    languageOptions: { globals: globals.jest }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ['./packages/*/tsconfig.json', './packages/*/__tests__/tsconfig.json', 'tsconfig.eslint.json']
      }
    }
  },
  {
    files: ['packages/core/src/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lodash',
              message: "Please use import * as _ from 'lodash-es' in the core module for better tree shaking."
            },
            {
              name: 'react-i18next',
              importNames: ['useTranslation', 'Translation'],
              message: 'Please use the `useExamTranslation` wrapper instead.'
            }
          ]
        }
      ]
    }
  }
]
