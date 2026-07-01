import type { Handle } from '@sveltejs/kit';
import { loadPlugins, hooks } from 'sveltekit-plugin-system';

// Load the plugins on the server. The glob is resolved relative to THIS file.
loadPlugins({
	plugins: import.meta.glob('./plugins/**/index.ts', { eager: true })
});

export const handle: Handle = async ({ resolve, event }) => {
	// Start from an empty locals object and let plugins filter it.
	event.locals = await hooks.applyFilter('server-locals', {});

	console.log('[hooks.server] event.locals after plugin filters =', event.locals);

	return await resolve(event);
};
