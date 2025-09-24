<script>
	let { group = $bindable(), label, description, outerCSS, options, error } = $props();
</script>

<fieldset class={outerCSS}>
	<legend class="text-sm/6 font-semibold text-gray-900 dark:text-white">{label}</legend>
	<p class="mt-1 text-sm/6 text-gray-600 dark:text-gray-500">{description}</p>
	<div class="mt-6 space-y-6 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
		{#each options as { id: innerId, name, value, label }, index}
			{@const id = innerId ?? crypto.randomUUID()}
			<div class="flex items-center">
				<input
					{id}
					{name}
					type="radio"
					{value}
					bind:group
					class="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden" />
				<label for={id} class="ml-3 block text-sm/6 font-medium text-gray-900 dark:text-white">{label}</label>
			</div>
		{/each}
	</div>
	{#if error}
		<p class="mt-2 text-sm text-red-600" id={`${name}-error`}>{@html error}</p>
	{/if}
</fieldset>
