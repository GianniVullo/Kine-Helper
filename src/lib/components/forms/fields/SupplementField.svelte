<script>
	import BoutonPrincipal from '$lib/components/BoutonPrincipal.svelte';
	import MultipleSelect from './MultipleSelect.svelte';

	let { value = $bindable(), errors, supplements } = $props();
	const options = supplements.map((s) => ({
		label: `${s.nom} - ${s.valeur}€`,
		value: s.id,
		id: s.id
	}));
</script>

<!-- options was fulfilled -->
<div class="col-span-full">
	{#if supplements && supplements.length > 0}
		<MultipleSelect
			label="Suppléments"
			bind:value
			{options}
			help="cmd+click pour ajouter ou enlever un supplément" />
		{#if errors}
			<p class="mt-2 text-sm text-red-600" id={`supplements-error`}>{@html errors}</p>
		{/if}
	{:else}
		<label for="location" class="block text-sm/6 font-medium text-gray-900">Suppléments</label>
		<p class="mt-3 mb-2 text-sm/6 text-gray-600">Vous n'avez aucuns suppléments enregistrés</p>
		<BoutonPrincipal href="/dashboard/finances/tarifs-form" inner="Ajouter des suppléments" />
	{/if}
</div>
