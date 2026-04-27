const js = require('@eslint/js');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', '.git/**', '.next/**', 'coverage/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        setImmediate: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly',
      },
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-underscore-dangle': 'off',
      'class-methods-use-this': 'off',
      'consistent-return': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'no-param-reassign': ['error', { props: false }],
    },
  },
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      'no-unused-expressions': 'off',
    },
  },
];
