module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: 'standard',
  parserOptions: {
    ecmaVersion: 13
  },
  rules: {
    semi: [2, 'always'],
    indent: ['error', 2],
    'no-undef': 'error',
    'no-trailing-spaces': ['error', { skipBlankLines: true }],
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: false }
    ]
  }
};
