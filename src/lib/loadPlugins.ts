import { hooks } from './hookStore.js';

export const loadPlugins = (options: any = {}) => {
	const plugins = options?.plugins
		? options.plugins
		: import.meta.glob('../../plugins/**/index.(ts|js)', { eager: true });
	for (const plugin of Object.values(plugins) as any) {
		plugin.default.init(hooks);
	}
	hooks.update((_hooks: any) => {
		_hooks.initialized = true;
		return _hooks;
	});
};
