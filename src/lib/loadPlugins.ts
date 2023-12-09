import type { KnownAsTypeMap } from 'vite';
import { hooks } from './hookStore.js';

export const loadPlugins = (options: Record<string, KnownAsTypeMap> = {}) => {
	const plugins = options?.plugins
		? options.plugins
		: import.meta.glob('../../**/plugins/**/index.(ts|js)', { eager: true });

	for (const plugin of Object.values(plugins) as any) {
		if (typeof plugin.default === 'function') {
			plugin.default(hooks);
		}
	}

	hooks.update((_hooks: any) => {
		_hooks.initialized = true;
		return _hooks;
	});
};
