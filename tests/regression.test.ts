import { describe, it, expect } from 'vitest';
import { createHooksStore } from '$lib';
import Probe from './fixtures/Probe.svelte';

/**
 * Regression tests pinning the specific bugs fixed during the Svelte 5 migration.
 */
describe('regressions', () => {
	// Previously `applyFilter` was called without `await` in hooks.server.ts, so a
	// Promise (not the filtered value) was assigned. `applyFilter` must be async
	// and resolve to the transformed value.
	it('applyFilter returns a Promise resolving to the filtered value', async () => {
		const hooks = createHooksStore();
		hooks.addFilter('title', (t: string) => `${t}-filtered`);
		const returned = hooks.applyFilter('title', 'x');
		expect(returned).toBeInstanceOf(Promise);
		expect(await returned).toBe('x-filtered');
	});

	// The runes store once used `$state.snapshot` in subscribe/update, which threw
	// `state_snapshot_uncloneable` because components/callbacks are functions.
	// Subscribing while the store holds component payloads must not throw.
	it('subscribe/update do not throw when the store holds component payloads', () => {
		const hooks = createHooksStore();
		hooks.addComponent('after-content', Probe);
		hooks.addAction('evt', () => {});

		let received: unknown;
		expect(() => {
			const unsub = hooks.subscribe((v) => (received = v));
			unsub();
		}).not.toThrow();
		expect(received).toBeDefined();

		expect(() =>
			hooks.update((s) => {
				s.initialized = true;
				return s;
			})
		).not.toThrow();
	});

	// The public API historically exposed the Writable contract; keep set/update/
	// subscribe present so legacy `$hooks` consumers keep working.
	it('keeps the Writable store surface (subscribe/set/update)', () => {
		const hooks = createHooksStore();
		expect(typeof hooks.subscribe).toBe('function');
		expect(typeof hooks.set).toBe('function');
		expect(typeof hooks.update).toBe('function');
	});
});
