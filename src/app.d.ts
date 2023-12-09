import type { Updater, Writable } from 'svelte/store';
import type { ComponentType } from 'svelte';

declare global {
	namespace Plugins {
		type hookStore = {
			components: { [location: string]: ComponentType };
			actions: { [location: string]: any };
			filters: { [location: string]: any };
			initialized: boolean;
		};

		type hookCreateStore = {
			subscribe: Writable;
			update: Updater;
			set: Set;

			addComponent: (location: string, component: ComponentType) => void;

			addAction: (location: string, callback: any) => void;

			doAction: (location: string) => void;

			addFilter: (location: string, filter: any) => void;

			applyFilter: (location: string, data: any) => any;
		};
	}
}

export { Plugins };
