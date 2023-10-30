declare global {
	// values are statically replaced at compile time by esbuild.
	// See scripts/build.js for more information.
	const RELEASE: string;
}

export {};
