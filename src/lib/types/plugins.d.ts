import type { Writable } from 'svelte/store';
import type { ComponentType } from 'svelte';

declare global {
	namespace Plugins {
		export interface HookStore {
			components: { [location: string]: ComponentType };
			actions: { [location: string]: any };
			filters: { [location: string]: any };
			initialized: boolean;
		}

		export interface HookCreateStore extends Writable<HookStore> {
			addComponent: (location: string, component: ComponentType) => void;
			addAction: (location: string, callback: any) => void;
			doAction: (location: string) => void;
			addFilter: (location: string, filter: any) => void;
			applyFilter: (location: string, data: any) => any;
		}
	}
}

export type { Plugins };
