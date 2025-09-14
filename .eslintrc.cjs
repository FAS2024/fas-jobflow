module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './backend/tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': 'warn',
    'no-unused-vars': 'warn',
  },
  ignorePatterns: ['node_modules', 'dist'],
};
