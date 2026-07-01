// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface Locals {
			[key: string]: unknown;
		}
	}
}

export {};
