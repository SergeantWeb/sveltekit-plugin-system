import type { Plugins } from 'sveltekit-plugin-system';
import HelloBanner from './HelloBanner.svelte';

/**
 * A plugin is a default-exported function that receives the `hooks` store
 * and registers components / actions / filters on named locations.
 */
export default (hooks: Plugins.HookCreateStore) => {
	/* 1. COMPONENT HOOK — inject a component into the `after-content` location. */
	hooks.addComponent('after-content', HelloBanner);

	/* 2. ACTION — run a side effect. Extra arguments passed to `doAction` are forwarded. */
	hooks.addAction('page-loaded', (pageName: string) => {
		console.log(`[hello-plugin] page "${pageName}" was loaded`);
	});

	/* 3. FILTER — transform a value. Filters registered on the same location compose. */
	hooks.addFilter('page-title', (title: string) => `${title} 🚀`);

	/* 4. SERVER FILTER — runs in hooks.server.ts to enrich event.locals. */
	hooks.addFilter('server-locals', (locals: Record<string, unknown>) => {
		locals.injectedBy = 'hello-plugin';
		return locals;
	});
};
