<script>
	let { label, options, name, value = $bindable(), help } = $props();
</script>

<div>
	<label for={name} class="block text-sm/6 font-medium text-gray-900 dark:text-white"
		>{label}</label>
	<div class="mt-2 w-full">
		<select
			id={name}
			multiple
			{name}
			bind:value
			class="w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus-visible:outline-indigo-500">
			{#each options as option}
				<option id={option?.id} value={option?.value} label={option?.label}></option>
			{/each}
		</select>
	</div>
</div>
{#if help}
	<p class="mt-3 text-sm/6 text-gray-600">{help}</p>
{/if}
