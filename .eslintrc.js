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
		ecmaVersion: 3
	},
	rules: {
		"indent": 0,
		"no-trailing-spaces": "off"
	},
	plugins: [
		"eslint-plugin-done-component",
		"eslint-plugin-html",
		"eslint-plugin-import",
		"eslint-plugin-jsx-a11y"
	],
};
