import type {Plugins} from "./types/plugins.d";
import type { ComponentType } from 'svelte';
import type { Writable } from 'svelte/store';
import { get, writable } from 'svelte/store';

const createHooksStore = (): Plugins.HookCreateStore => {
	const { subscribe, set, update }: Writable<Plugins.HookStore> = writable({
		components: {},
		actions: {},
		filters: {},
		initialized: false
	});

	const addHook = (location: string, type: string, target: any) => {
		const _hooks: any = get(hooks);
		if (_hooks.initialized === true) return;
		update((hooks: any) => {
			if (typeof hooks[type][location] === 'undefined') {
				hooks[type][location] = [];
			}
			if (Array.isArray(hooks[type][location]) && !hooks[type][location].includes(target)) {
				hooks[type][location].push(target);
			}
			return hooks;
		});
	};

	return {
		subscribe,
		update,
		set,

		/* Components */
		addComponent: (location: string, component: ComponentType) => {
			addHook(location, 'components', component);
		},

		/* Actions */
		addAction: (location: string, callback: any) => {
			addHook(location, 'actions', callback);
		},
		doAction: (location: string) => {
			const _hooks: any = get(hooks);
			if (_hooks.actions?.[location]) {
				for (const action of _hooks.actions[location]) {
					action();
				}
			}
		},

		/* Filters */
		addFilter: (location: string, filter: any) => {
			addHook(location, 'filters', filter);
		},
		applyFilter: (location: string, data: any) => {
			const _hooks: any = get(hooks);
			if (_hooks.filters?.[location]) {
				for (const filter of _hooks.filters[location]) {
					data = filter(data);
				}
			}
			return data;
		}
	};
};
export const hooks = createHooksStore();
