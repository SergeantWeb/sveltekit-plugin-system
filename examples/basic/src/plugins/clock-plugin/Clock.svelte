<script lang="ts">
	let now = $state(new Date().toLocaleTimeString());

	$effect(() => {
		const id = setInterval(() => (now = new Date().toLocaleTimeString()), 1000);
		return () => clearInterval(id);
	});
</script>

<div class="clock">🕒 {now}</div>

<style>
	.clock {
		font-variant-numeric: tabular-nums;
		padding: 0.5rem 0.75rem;
		border: 1px dashed #999;
		border-radius: 8px;
		display: inline-block;
	}
</style>
