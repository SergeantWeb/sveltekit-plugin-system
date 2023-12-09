<script lang="ts">
	import { loadPlugins } from '$lib/loadPlugins';
	import { hooks } from '$lib/hookStore';
	loadPlugins();

	$: hooks.doAction('log-something');
</script>

<slot />
