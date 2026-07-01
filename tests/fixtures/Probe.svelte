<script lang="ts">
	// A tiny component used to verify component hooks render and receive props.
	let { label = 'probe' }: { label?: string } = $props();
</script>

<div data-testid="probe">{label}</div>
