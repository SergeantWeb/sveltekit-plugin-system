<script lang="ts">
	import { hooks } from '$lib';

	export let location: string;
</script>

{#if $hooks.components?.[location]}
	{#each $hooks.components?.[location] as hook}
		<svelte:component this={hook} {...$$restProps} />
	{/each}
{/if}
