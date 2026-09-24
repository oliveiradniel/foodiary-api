import swc from 'unplugin-swc';

export default () => ({
	bundle: true,
	minify: true,
	sourcemap: false,
	exclude: ['@aws-sdk/*'],
	external: ['@aws-sdk/*'],
	plugins: [swc.esbuild()],
});
