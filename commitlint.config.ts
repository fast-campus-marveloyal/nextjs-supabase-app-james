import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      // 이모지 접두사 허용: "🔧 chore: ..." 형식 지원
      headerPattern: /^(?:[^\w\s]+\s+)?(\w*)(?:\((.+)\))?!?: (.+)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'ci',
        'revert',
      ],
    ],
    'subject-max-length': [2, 'always', 72],
    'subject-case': [0],
    'body-max-line-length': [0],
  },
}

export default config
