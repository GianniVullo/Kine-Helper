<script>
	let { options, group = $bindable() } = $props();
</script>

<fieldset aria-label="Factures filters">
	<div class="space-y-5">
		{#each options as { label, description, value }}
			<div class="relative flex items-start">
				<div class="flex h-6 items-center">
					<input
						id={value}
						aria-describedby="Factures filters-description"
						{value}
						name="plan"
						type="radio"
						bind:group
						class="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden" />
				</div>
				<div class="ml-3 text-sm/6">
					<label for={value} class="font-medium text-gray-900">{label}</label>
					<p id={value} class="text-gray-500">{description}</p>
				</div>
			</div>
		{/each}
	</div>
</fieldset>
