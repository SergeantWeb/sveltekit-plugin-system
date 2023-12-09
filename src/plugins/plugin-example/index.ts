import type { Plugins } from '../../app';
import ComponentExample from './ComponentExample.svelte';

export default (hooks: Plugins.hookCreateStore) => {
	// Insert a component to `after-content` location.
	hooks.addComponent('after-content', ComponentExample);

	// Add an action to `log-something` location.
	hooks.addAction('log-something', () => {
		console.log('This log message comes from a plugin!');
	});

	// Filter event.locals
	hooks.addFilter('server-locals', (locals: { [key: string]: string }) => {
		locals.test = 'ok';
		return locals;
	});
};
