import type { Plugins } from './types/plugins.js';
import type { Component } from 'svelte';

/**
 * Creates an isolated hooks store. The package exports a shared singleton
 * (`hooks`), but this factory is exported too so tests (and advanced use cases)
 * can spin up a fresh, independent store.
 */
export const createHooksStore = (): Plugins.HookCreateStore => {
	const state = $state<Plugins.HookStore>({
		components: {},
		actions: {},
		filters: {},
		initialized: false
	});

	const addHook = (location: string, type: 'components' | 'actions' | 'filters', target: any) => {
		if (state.initialized === true) return;
		if (typeof state[type][location] === 'undefined') {
			state[type][location] = [];
		}
		if (Array.isArray(state[type][location]) && !state[type][location].includes(target)) {
			state[type][location].push(target);
		}
	};

	/**
	 * Writable-compatible `subscribe` so that legacy `$hooks` usage keeps working.
	 * Backed by the runes state through an effect root.
	 */
	// Read every nested signal so the surrounding effect re-runs on any mutation.
	// We can't use `$state.snapshot` here because the stored components/callbacks
	// are functions and are therefore uncloneable.
	const track = () => {
		void state.initialized;
		for (const type of ['components', 'actions', 'filters'] as const) {
			for (const location in state[type]) {
				void state[type][location].length;
			}
		}
	};

	const subscribe = (run: (value: Plugins.HookStore) => void): (() => void) => {
		// Deliver the current value synchronously (required by the store contract,
		// and the only value available during SSR where effects do not run).
		run(state);
		return $effect.root(() => {
			$effect(() => {
				track();
				run(state);
			});
		});
	};

	const set = (value: Plugins.HookStore) => {
		state.components = value.components;
		state.actions = value.actions;
		state.filters = value.filters;
		state.initialized = value.initialized;
	};

	const update = (updater: (value: Plugins.HookStore) => Plugins.HookStore) => {
		// The updater mutates the live reactive state in place.
		updater(state);
	};

	return {
		subscribe,
		set,
		update,

		/* Reactive read accessors (runes) */
		get components() {
			return state.components;
		},
		get actions() {
			return state.actions;
		},
		get filters() {
			return state.filters;
		},
		get initialized() {
			return state.initialized;
		},

		/* Components */
		addComponent: (location: string, component: Component) => {
			addHook(location, 'components', component);
		},

		/* Actions */
		addAction: (location: string, callback: any) => {
			addHook(location, 'actions', callback);
		},
		doAction: async (location: string, ...args: any) => {
			if (state.actions?.[location]) {
				for (const action of state.actions[location]) {
					if (action[Symbol.toStringTag] === 'AsyncFunction') {
						await action(...args);
					} else {
						action(...args);
					}
				}
			}
		},

		/* Filters */
		addFilter: (location: string, filter: any) => {
			addHook(location, 'filters', filter);
		},
		applyFilter: async (location: string, data: any, ...args: any) => {
			if (state.filters?.[location]) {
				for (const filter of state.filters[location]) {
					if (filter[Symbol.toStringTag] === 'AsyncFunction') {
						data = await filter(data, ...args);
					} else {
						data = filter(data, ...args);
					}
				}
			}
			return data;
		}
	};
};

export const hooks = createHooksStore();
