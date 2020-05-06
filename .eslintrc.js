module.exports = {
	env: {
		browser: true,
		node: true,
		jasmine: true,
		jquery: true,
		qunit: true
	},
	extends: "airbnb",
	parserOptions: {
		ecmaVersion: 2017
	},
	rules: {
		"new-cap": "off",
		"no-undef": "off",
		"import/no-unresolved": "off",
		"prefer-reset-params": "off",
		"no-multiple-empty-lines": "off",
		"no-underscore-dangle": "off",
		"max-len": "off",
		"prefer-arrow-callback": "off",
		"no-var": "off",
		"quotes": "off",
		"indent": 0,
		"import/first": "off",
		"no-trailing-spaces": "off",
		"one-var": "off",
		"no-shadow": "off",
		"comma-dangle": "off",
		"wrap-iife": "off",
		"no-console": "off",
		"prefer-rest-params": "off",
		"arrow-body-style": "off",
		"no-prototype-builtins": "off",
		"no-param-reassign": "off",
		"import/newline-after-import": "warn",
		"no-plusplus": "warn",
		"spaced-comment": "warn",
		"class-methods-use-this": "warn",
		"strict": "warn",
		"no-unused-vars": "warn",
		"operator-assignment": "warn",
		"semi-spacing": "warn",
		"space-infix-ops": "warn",
		"no-nested-ternary": "warn",
		"no-nested-ternary": "warn",
		"import/no-webpack-loader-syntax": "warn",
		"lines-around-directive": "warn",
		"prefer-template": "warn",
		"import/no-mutable-exports": "warn",
		"import/extensions": ["warn", "never", {
			"js": "never",
			"json": "always",
		}],
		"import/no-extraneous-dependencies": [
			"error", {"devDependencies": true}
		],
	},
	plugins: [
		"eslint-plugin-done-component",
		"eslint-plugin-html",
		"eslint-plugin-import",
		"eslint-plugin-jsx-a11y",
		"eslint-plugin-promise",
		"eslint-plugin-react"
	],
	settings: {
	}
};
