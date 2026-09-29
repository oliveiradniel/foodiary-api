import swc from 'unplugin-swc';

export default () => ({
	bundle: true,
	minify: true,
	sourcemap: false,
	exclude: ['@aws-sdk/*'],
	external: ['@aws-sdk/*'],
	banner: {
		js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
	},
	plugins: [swc.esbuild()],
});
