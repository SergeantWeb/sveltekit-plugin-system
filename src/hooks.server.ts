import type { Handle } from '@sveltejs/kit';
import { loadPlugins } from '$lib/loadPlugins';
import { hooks } from '$lib/hookStore';

export const handle: Handle = async ({ resolve, event }) => {
	loadPlugins(); // Load plugins server-side

	event.locals = {}; // Init locals as an empty object

	// Filter event.locals from plugins
	event.locals = hooks.applyFilter('server-locals', event.locals);

	if (Object.keys(event.locals).length > 0) {
		console.log('> A plugin is filtering event.locals :');
		console.log('> event.locals =', event.locals);
	}

	return await resolve(event);
};
