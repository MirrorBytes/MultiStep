const eslintSveltePreprocess = require('eslint-svelte3-preprocess');
const sveltePreprocess = require('svelte-preprocess');

// NOTE: Can't run Prettier here until Svelte has better linting support.

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    createDefaultProgram: true,
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  extends: ['eslint:recommended'],
  plugins: ['svelte3', '@typescript-eslint'],
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
    },
    {
      files: ['*.ts', '*.json'],
      extends: ['plugin:@typescript-eslint/recommended'],
    },
  ],
  settings: {
    'svelte3/preprocess': eslintSveltePreprocess(
      sveltePreprocess({
        typescript: {
          tsconfigFile: './tsconfig.json',
        },
      }),
    ),
  },
};
