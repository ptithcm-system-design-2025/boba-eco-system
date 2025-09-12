module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 65],
    'body-max-line-length': [2, 'always', 72],
    'scope-empty': [0],
    'type-enum': [0],
    'signed-off-by': [2, 'always'],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
    'subject-empty': [0],
    'subject-full-stop': [0],
    'type-empty': [0],
    'type-case': [0],
  },
};