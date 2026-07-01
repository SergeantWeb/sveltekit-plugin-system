<script lang="ts">
	// Props passed through <Hook location="after-content" {...restProps} />
	let { from = 'Hello plugin' }: { from?: string } = $props();
</script>

<div class="banner">
	🔌 This component was injected by <strong>{from}</strong> into the
	<code>after-content</code> location.
</div>

<style>
	.banner {
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		border: 1px solid #b3d4fc;
		background: #eaf3ff;
		border-radius: 8px;
	}
</style>
