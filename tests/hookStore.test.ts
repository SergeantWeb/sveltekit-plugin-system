import { describe, it, expect, vi } from 'vitest';
import { flushSync } from 'svelte';
import { createHooksStore } from '$lib';
import type { Plugins } from '$lib';

// A fresh, isolated store per test.
const store = (): Plugins.HookCreateStore => createHooksStore();

// A real async function so `[Symbol.toStringTag] === 'AsyncFunction'` is true.
const asyncFn =
	<T extends (...args: any[]) => any>(fn: T) =>
	async (...args: Parameters<T>) =>
		fn(...args);

describe('hooks store — components', () => {
	it('registers a component under a location', () => {
		const hooks = store();
		const C = (() => {}) as never;
		hooks.addComponent('after-content', C);
		expect(hooks.components['after-content']).toEqual([C]);
	});

	it('does not register the same component twice (dedup)', () => {
		const hooks = store();
		const C = (() => {}) as never;
		hooks.addComponent('after-content', C);
		hooks.addComponent('after-content', C);
		expect(hooks.components['after-content']).toHaveLength(1);
	});
});

describe('hooks store — actions', () => {
	it('runs all actions for a location with forwarded extra args', async () => {
		const hooks = store();
		const first = vi.fn();
		const second = vi.fn();
		hooks.addAction('evt', first);
		hooks.addAction('evt', second);
		await hooks.doAction('evt', 'a', 1);
		expect(first).toHaveBeenCalledWith('a', 1);
		expect(second).toHaveBeenCalledWith('a', 1);
	});

	it('awaits async actions before resolving', async () => {
		const hooks = store();
		const order: string[] = [];
		hooks.addAction(
			'evt',
			asyncFn(async () => {
				await new Promise((r) => setTimeout(r, 10));
				order.push('async');
			})
		);
		await hooks.doAction('evt');
		order.push('after');
		expect(order).toEqual(['async', 'after']);
	});

	it('is a no-op for an unknown location', async () => {
		const hooks = store();
		await expect(hooks.doAction('missing')).resolves.toBeUndefined();
	});
});

describe('hooks store — filters', () => {
	it('chains filters in registration order and forwards extra args', async () => {
		const hooks = store();
		hooks.addFilter('title', (t: string) => `${t}!`);
		hooks.addFilter('title', (t: string, suffix: string) => `${t}${suffix}`);
		const result = await hooks.applyFilter('title', 'hi', '?');
		expect(result).toBe('hi!?');
	});

	it('awaits async filters', async () => {
		const hooks = store();
		hooks.addFilter(
			'title',
			asyncFn(async (t: string) => `${t}-async`)
		);
		expect(await hooks.applyFilter('title', 'x')).toBe('x-async');
	});

	it('returns the input unchanged for an unknown location', async () => {
		const hooks = store();
		expect(await hooks.applyFilter('missing', 'value')).toBe('value');
	});
});

describe('hooks store — initialized guard', () => {
	it('ignores further hooks once initialized', () => {
		const hooks = store();
		hooks.update((s) => {
			s.initialized = true;
			return s;
		});
		hooks.addAction('late', () => {});
		expect(hooks.actions['late']).toBeUndefined();
		expect(hooks.initialized).toBe(true);
	});
});

describe('hooks store — Writable compatibility (deprecated $hooks)', () => {
	it('delivers the current value synchronously on subscribe', () => {
		const hooks = store();
		hooks.addAction('evt', () => {});
		let received: Plugins.HookStore | undefined;
		const unsub = hooks.subscribe((v) => (received = v));
		expect(received?.actions.evt).toHaveLength(1);
		unsub();
	});

	it('reacts to later mutations through the subscription', () => {
		const hooks = store();
		const values: number[] = [];
		const unsub = hooks.subscribe((v) => values.push(Object.keys(v.actions).length));
		hooks.addAction('evt', () => {});
		flushSync();
		unsub();
		expect(values.at(-1)).toBe(1);
	});
});
