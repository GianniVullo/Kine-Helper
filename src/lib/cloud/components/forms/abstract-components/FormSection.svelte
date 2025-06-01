<script>
	import { extractErrorForField } from '../../../libraries/formHandler.svelte';
	import Field from './Field.svelte';

	let { titre, description = undefined, form = $bindable(), fields, children, errors } = $props();
</script>

<div class="border-b border-gray-900/10 pb-12">
	<h2 class="text-base/7 font-semibold text-gray-900">{titre}</h2>
	{#if description}
		<p class="mt-1 text-sm/6 text-gray-600">
			{description}
		</p>
	{/if}
	<div class="mt-10 grid gap-x-6 gap-y-8 grid-cols-6">
		{#if children}
			{@render children()}
		{:else}
			{#each fields as field}
				<Field {field} error={errors[field.name]} bind:value={form[field.name]} />
			{:else}
				Il n'y a aucun champs à afficher
			{/each}
		{/if}
	</div>
</div>
