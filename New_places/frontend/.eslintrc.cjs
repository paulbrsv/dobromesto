module.exports = {
  extends: ['../eslint.base.cjs', 'plugin:react/recommended', 'plugin:react-hooks/recommended', 'plugin:jsx-a11y/recommended'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
};
