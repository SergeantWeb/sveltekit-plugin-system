import { loadPlugins } from 'sveltekit-plugin-system';

// Register the plugins in a layout `load`, which runs BEFORE any page `load`
// (and before components mount) on both the server and the client. This is the
// key to making filters/components available everywhere — including inside
// child `load` functions. `loadPlugins` is idempotent (guarded by `initialized`).
export const load = () => {
	loadPlugins({
		plugins: import.meta.glob('../plugins/**/index.ts', { eager: true })
	});
};
