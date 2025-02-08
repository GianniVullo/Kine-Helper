<script>
	import { extractErrorForField } from '../../../libraries/formHandler.svelte';
	import Field from './Field.svelte';

	let {
		titre,
		description = undefined,
		form = $bindable(),
		fields,
		customField,
		validationState
	} = $props();
</script>

<div class="border-b border-gray-900/10 pb-12">
	<h2 class="text-base/7 font-semibold text-gray-900">{titre}</h2>
	{#if description}
		<p class="mt-1 text-sm/6 text-gray-600">
			{description}
		</p>
	{/if}
	<div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
		{#if customField}
			{@render customField()}
		{:else}
			{#each fields as field}
				<Field
					{field}
					error={extractErrorForField(field.name, validationState).errorString}
					bind:value={form[field.name]} />
			{:else}
				Il n'y a aucun champs à afficher
			{/each}
		{/if}
	</div>
</div>
