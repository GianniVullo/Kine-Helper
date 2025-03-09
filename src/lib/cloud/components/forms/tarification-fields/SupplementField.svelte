<script>
	import MultipleSelect from '../fields/MultipleSelect.svelte';

	let { value = $bindable(), errors, supplements } = $props();
	const options = supplements.map((s) => ({
		label: `${s.nom} - ${s.valeur}€`,
		value: s.id,
		id: s.id
	}));
</script>

<!-- options was fulfilled -->
<div class="col-span-full">
	<MultipleSelect
		label="Suppléments"
		bind:value
		{options}
		help="cmd+click pour ajouter ou enlever un supplément" />
	{#if errors}
		<p class="mt-2 text-sm text-red-600" id={`${name}-error`}>{@html errors}</p>
	{/if}
</div>
