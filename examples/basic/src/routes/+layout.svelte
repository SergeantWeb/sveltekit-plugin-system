<script lang="ts">
	import { Hook } from 'sveltekit-plugin-system';

	// Plugins are registered in `+layout.ts` (load), so they are ready before any
	// component mounts or any child `load` runs — on both the server and client.
	let { children } = $props();
</script>

<div class="app">
	<aside>
		<h3>Sidebar</h3>
		<!-- Components registered on the `sidebar` location render here. -->
		<Hook location="sidebar" />
	</aside>

	<main>
		{@render children()}
	</main>
</div>

<style>
	:global(body) {
		font-family: system-ui, sans-serif;
		margin: 0;
	}
	.app {
		display: grid;
		grid-template-columns: 220px 1fr;
		gap: 1.5rem;
		padding: 1.5rem;
	}
	aside {
		border-right: 1px solid #eee;
		padding-right: 1rem;
	}
</style>
