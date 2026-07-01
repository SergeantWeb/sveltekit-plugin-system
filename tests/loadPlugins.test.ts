import { describe, it, expect, vi } from 'vitest';
import { loadPlugins, hooks } from '$lib';
import type { Plugins } from '$lib';

describe('loadPlugins', () => {
	it('invokes each plugin default export with the hooks store and marks it initialized', () => {
		const order: string[] = [];
		const plugins = {
			'./a/index.ts': {
				default: (h: Plugins.HookCreateStore) => {
					h.addAction('x', () => {});
					order.push('a');
				}
			},
			'./b/index.ts': {
				default: (h: Plugins.HookCreateStore) => {
					h.addFilter('y', (d: unknown) => d);
					order.push('b');
				}
			},
			'./c/index.ts': {} // no default export → ignored
		};

		loadPlugins({ plugins });

		expect(order).toEqual(['a', 'b']);
		expect(hooks.initialized).toBe(true);
		expect(Object.keys(hooks.actions)).toContain('x');
		expect(Object.keys(hooks.filters)).toContain('y');
	});

	it('regression: once loaded, plugins can no longer register hooks', () => {
		// The singleton is already initialized by the previous test in this file.
		const spy = vi.fn();
		hooks.addAction('too-late', spy);
		expect(hooks.actions['too-late']).toBeUndefined();
	});
});
