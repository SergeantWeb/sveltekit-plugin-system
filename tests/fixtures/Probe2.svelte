<script lang="ts">
	let { label = 'probe2' }: { label?: string } = $props();
</script>

<div data-testid="probe">{label}</div>
