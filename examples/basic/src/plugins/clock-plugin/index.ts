import type { Plugins } from 'sveltekit-plugin-system';
import Clock from './Clock.svelte';

export default (hooks: Plugins.HookCreateStore) => {
	/* Another component, in a different location (`sidebar`). */
	hooks.addComponent('sidebar', Clock);

	/* ASYNC ACTION — actions may be async; `doAction` awaits them. */
	hooks.addAction('page-loaded', async (pageName: string) => {
		await new Promise((r) => setTimeout(r, 50));
		console.log(`[clock-plugin] (async) finished handling "${pageName}"`);
	});

	/* A second filter on `page-title` — filters chain in registration order. */
	hooks.addFilter('page-title', (title: string) => `${title} • powered by plugins`);
};
