import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { hooks, Hook } from '$lib';
import Probe from './fixtures/Probe.svelte';
import Probe2 from './fixtures/Probe2.svelte';

describe('Hook.svelte', () => {
	it('renders components registered at a location and forwards rest props', () => {
		hooks.addComponent('after-content', Probe);

		const { getByTestId } = render(Hook, {
			props: { location: 'after-content', label: 'hello' }
		});

		expect(getByTestId('probe')).toHaveTextContent('hello');
	});

	it('renders nothing for a location with no registered components', () => {
		const { queryByTestId } = render(Hook, { props: { location: 'empty' } });
		expect(queryByTestId('probe')).toBeNull();
	});

	it('renders every component registered at a location', () => {
		hooks.addComponent('multi', Probe);
		hooks.addComponent('multi', Probe2);

		const { getAllByTestId } = render(Hook, { props: { location: 'multi', label: 'x' } });
		expect(getAllByTestId('probe')).toHaveLength(2);
	});
});
