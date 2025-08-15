import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
	js.configs.recommended,
	prettier,
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				// Browser globals
				window: 'writable',
				document: 'readonly',
				console: 'readonly',
				fetch: 'readonly',
				requestAnimationFrame: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				FormData: 'readonly',
				Event: 'readonly',
				HTMLElement: 'readonly',
				HTMLFormElement: 'readonly',
				URL: 'readonly',
				Blob: 'readonly',
				navigator: 'readonly',
				ClipboardItem: 'readonly',

				// Node.js globals (for server files)
				require: 'readonly',
				module: 'readonly',
				exports: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				process: 'readonly',
				Buffer: 'readonly',
				global: 'readonly',
				DOMParser: 'readonly',
				XMLSerializer: 'readonly'
			}
		},
		rules: {
			// Best practices (no formatting rules that conflict with Prettier)
			'no-var': 'error',
			'prefer-const': 'error',
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'no-console': 'warn',
			'no-debugger': 'error',
			'no-alert': 'warn',
			'eol-last': 'error'
			// Indentation is handled by Prettier, not ESLint
		}
	},
	{
		files: ['public/**/*.js'],
		languageOptions: {
			sourceType: 'script' // Browser files use script mode
		}
	},
	{
		files: ['server.js', '**/*.mjs'],
		languageOptions: {
			sourceType: 'module' // Server files use module mode
		}
	}
];
