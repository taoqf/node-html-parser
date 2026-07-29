import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['cjs', 'esm', 'umd'],
	globalName: 'nodeHTMLParser',
	target: 'es6',
	platform: 'node',
	checks: {
		mixedExports: false,
	},
	clean: true,
	dts: false,
	sourcemap: false,
	outExtensions: ({ format }) => {
		if (format === 'cjs') return { js: '.cjs', dts: '.d.ts' }
		if (format === 'es') return { js: '.mjs', dts: '.d.mts' }
		return {}
	},
	deps: {
		alwaysBundle: ['entities', 'css-select'],
		onlyBundle: false,
	},
})
