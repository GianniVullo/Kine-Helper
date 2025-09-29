<script>
	import { Field } from '../blocks';
	let { open = $bindable(), name, description, formHandler = $bindable(), fields } = $props();
</script>

<div class="col-span-full mb-3 rounded-lg border p-4">
	<button
		type="button"
		class="flex w-full items-center justify-between text-left"
		onclick={() => (open = !open)}>
		<div>
			<h4 class="font-medium">{name}</h4>
			<p class="text-sm text-gray-500">{description}</p>
		</div>
		<svg
			class="h-5 w-5 transition-transform {open ? 'rotate-180' : ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if open}
		<div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
			{#each fields as field}
				<Field {field} bind:value={formHandler.form[field.name]} />
			{/each}

			<button
				type="button"
				class="text-sm text-gray-600 hover:text-gray-800"
				onclick={() => {
					for (const field of fields) {
						formHandler.form[field.name] = field.dataDefaultValue;
					}
				}}>
				Réinitialiser cette section
			</button>
		</div>
	{/if}
</div>
