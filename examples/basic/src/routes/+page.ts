import { hooks } from 'sveltekit-plugin-system';

// Universal load: runs on the server (for SSR) and on the client (on navigation).
// We `await parent()` first so the layout `load` (which registers the plugins)
// has run — guaranteeing the `page-title` filters are available here.
export const load = async ({ parent }) => {
	await parent();
	return {
		title: await hooks.applyFilter('page-title', 'My page')
	};
};
