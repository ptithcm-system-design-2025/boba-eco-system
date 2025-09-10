import eslintPluginPrettierRecommended, { ignores, languageOptions } from 'eslint-plugin-prettier/recommended';

module.exports = [
  {
    ignores : ['eslint.config.mjs'], 
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn'
    },
  },
  eslintPluginPrettierRecommended,
];