module.exports = {
	"env": {
		"browser": true,
		"es6": true,
		"node": true
	},
	"extends": [
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking"
	],
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"project": "tsconfig.json",
		"sourceType": "module"
	},
	"plugins": [
		"@typescript-eslint",
		"@typescript-eslint/tslint"
	],
	"rules": {
		"@typescript-eslint/prefer-includes": "off",
		"@typescript-eslint/unbound-method": "off",
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/member-delimiter-style": "error",
		"@typescript-eslint/no-misused-promises": "error",
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/camelcase": "off",
		"@typescript-eslint/adjacent-overload-signatures": "error",
		"@typescript-eslint/array-type": "error",
		"@typescript-eslint/ban-types": "error",
		"@typescript-eslint/naming-convention": "error",
		"@typescript-eslint/consistent-type-assertions": "error",
		"@typescript-eslint/indent": [
			"error",
			"tab",
			{
				"ArrayExpression": "first",
				"ObjectExpression": "first"
			}
		],
		"@typescript-eslint/interface-name-prefix": "off",
		"@typescript-eslint/no-empty-function": "off",
		"@typescript-eslint/no-empty-interface": "error",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-misused-new": "error",
		"@typescript-eslint/no-namespace": "error",
		"@typescript-eslint/no-parameter-properties": "off",
		"@typescript-eslint/no-use-before-define": "off",
		"@typescript-eslint/no-var-requires": "error",
		"@typescript-eslint/prefer-for-of": "error",
		"@typescript-eslint/prefer-function-type": "error",
		"@typescript-eslint/prefer-namespace-keyword": "error",
		"@typescript-eslint/quotes": [
			"error",
			"single",
			{
				"avoidEscape": true
			}
		],
		"@typescript-eslint/triple-slash-reference": "error",
		"@typescript-eslint/unified-signatures": "off",
		"camelcase": "off",
		"comma-dangle": "error",
		"complexity": "off",
		"constructor-super": "error",
		"dot-notation": "error",
		"eqeqeq": [
			"error",
			"smart"
		],
		"guard-for-in": "off",
		"id-blacklist": [
			"error",
			"any",
			"Number",
			"number",
			"String",
			"string",
			"Boolean",
			"boolean",
			"Undefined"
		],
		"id-match": "error",
		"max-classes-per-file": [
			"error",
			1
		],
		"max-len": "off",
		"new-parens": "error",
		"no-bitwise": "off",
		"no-caller": "error",
		"no-cond-assign": "off",
		"no-console": "off",
		"no-debugger": "error",
		"no-empty": "off",
		"no-eval": "error",
		"no-fallthrough": "off",
		"no-invalid-this": "off",
		"no-multiple-empty-lines": "off",
		"no-new-wrappers": "error",
		"no-shadow": [
			"error",
			{
				"hoist": "all"
			}
		],
		"no-throw-literal": "error",
		"no-trailing-spaces": "error",
		"no-undef-init": "error",
		"no-underscore-dangle": "off",
		"no-unsafe-finally": "error",
		"no-unused-expressions": "error",
		"no-unused-labels": "error",
		"no-var": "error",
		"object-shorthand": "error",
		"one-var": [
			"error",
			"never"
		],
		"prefer-arrow/prefer-arrow-functions": "off",
		"prefer-const": "error",
		"radix": "error",
		"spaced-comment": "error",
		"use-isnan": "error",
		"valid-typeof": "off",
		"@typescript-eslint/tslint/config": [
			"error",
			{
				"rules": {
					"jsdoc-format": true,
					"no-reference-import": true,
					"no-unsafe-any": true,
					"whitespace": [
						true,
						"check-branch",
						"check-operator"
					]
				}
			}
		]
	}
};
