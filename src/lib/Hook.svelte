<script lang="ts">
	import { hooks } from '$lib';

	let { location, ...rest }: { location: string; [key: string]: any } = $props();
</script>

{#each hooks.components?.[location] ?? [] as Item (Item)}
	<Item {...rest} />
{/each}
