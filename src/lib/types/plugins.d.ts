import type { Writable } from 'svelte/store';
import type { Component } from 'svelte';

declare global {
	namespace Plugins {
		export interface HookStore {
			components: { [location: string]: Component[] };
			actions: { [location: string]: any[] };
			filters: { [location: string]: any[] };
			initialized: boolean;
		}

		export interface HookCreateStore extends Writable<HookStore> {
			readonly components: HookStore['components'];
			readonly actions: HookStore['actions'];
			readonly filters: HookStore['filters'];
			readonly initialized: HookStore['initialized'];
			addComponent: (location: string, component: Component) => void;
			addAction: (location: string, callback: any) => void;
			doAction: (location: string, ...args: any) => Promise<void>;
			addFilter: (location: string, filter: any) => void;
			applyFilter: (location: string, data: any, ...args: any) => Promise<any>;
		}
	}
}

export type { Plugins };
