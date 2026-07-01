import type { Plugins } from './types/plugins.js';
import { hooks } from './hookStore.svelte.js';

/** A plugin module: a default-exported function that registers hooks. */
type PluginModule = { default?: (hooks: Plugins.HookCreateStore) => void };

type LoadPluginsOptions = {
	/**
	 * The plugin modules to load, typically the result of `import.meta.glob`.
	 * Defaults to eagerly globbing every `plugins/**\/index.(ts|js)` in the project.
	 */
	plugins?: Record<string, PluginModule>;
};

export const loadPlugins = (options: LoadPluginsOptions = {}) => {
	const plugins =
		options?.plugins ??
		(import.meta.glob('../../**/plugins/**/index.(ts|js)', {
			eager: true
		}) as Record<string, PluginModule>);

	for (const plugin of Object.values(plugins)) {
		if (typeof plugin.default === 'function') {
			plugin.default(hooks);
		}
	}

	hooks.update((_hooks) => {
		_hooks.initialized = true;
		return _hooks;
	});
};
