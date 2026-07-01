<script lang="ts">
	import { hooks, Hook } from 'sveltekit-plugin-system';
	import type { PageData } from './$types';

	// `title` comes from the `page-title` FILTER, applied in `+page.ts` (load),
	// so it is already filtered during SSR — see the chained plugin filters.
	let { data }: { data: PageData } = $props();

	// ---------------------------------------------------------------------------
	// ACTION — fire the `page-loaded` action (extra args are forwarded to handlers).
	// Runs on the client after mount; watch the browser console.
	// ---------------------------------------------------------------------------
	$effect(() => {
		hooks.doAction('page-loaded', 'Home');
	});

	// ---------------------------------------------------------------------------
	// MODERN read API (runes): read registered components reactively.
	// ---------------------------------------------------------------------------
	const componentLocations = $derived(Object.keys(hooks.components));

	// ---------------------------------------------------------------------------
	// DEPRECATED / legacy API: the `hooks` object still implements Svelte's
	// `Writable` store contract, so `$hooks` auto-subscription keeps working for
	// backwards compatibility. Prefer the runes accessors above in new code.
	// (Note: the old `$:` reactive-label form is not allowed in a runes component,
	//  but the `$hooks` store subscription itself still works.)
	// ---------------------------------------------------------------------------
	const legacyActionLocations = $derived(Object.keys($hooks.actions));
</script>

<svelte:head>
	<!-- The `page-title` FILTER drives the document <title> (browser tab), rendered
	     in the HTML <head> during SSR. -->
	<title>{data.title}</title>
</svelte:head>

<h1>{data.title}</h1>

<p>Open the browser console and the server terminal to see actions & filters run.</p>

<section>
	<h2>Filter (chained)</h2>
	<p>
		The title started as <code>"My page"</code> and was transformed by every
		<code>page-title</code> filter registered in the plugins (applied in <code>+page.ts</code>).
	</p>
</section>

<section>
	<h2>Component hook</h2>
	<!-- Components registered on `after-content` render here, receiving `from`. -->
	<Hook location="after-content" from="hello-plugin" />
</section>

<section>
	<h2>Registered hooks (modern runes read API)</h2>
	<p>Component locations: <code>{componentLocations.join(', ')}</code></p>
</section>

<section>
	<h2>Registered hooks (deprecated <code>$hooks</code> store)</h2>
	<p>Action locations: <code>{legacyActionLocations.join(', ')}</code></p>
</section>
