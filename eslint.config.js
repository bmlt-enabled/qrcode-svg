import js from '@eslint/js'
import globals from 'globals'
import prettier from 'eslint-config-prettier'
import html from 'eslint-plugin-html'

export default [
    { ignores: ['dist/**', 'node_modules/**'] },
    js.configs.recommended,
    prettier,
    {
        // Lint the inline <script> blocks in the example pages too.
        files: ['**/*.html'],
        plugins: { html },
        languageOptions: {
            globals: {
                // Leaflet is loaded as a global <script> in the examples.
                L: 'readonly',
            },
        },
    },
    {
        files: ['**/*.js', '**/*.html'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2022,
            },
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                extraFileExtensions: ['.js'],
            },
        },
        rules: {
            'no-var': ['error'],
            'prefer-const': ['error'],
            'no-empty': ['error', { allowEmptyCatch: true }],
        },
    },
]
