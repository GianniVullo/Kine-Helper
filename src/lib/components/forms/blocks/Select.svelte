<script>
	let {
		onchange = undefined,
		options,
		value = $bindable(),
		ariaLabel = 'Select an option'
	} = $props();
</script>

<select
	aria-label={ariaLabel}
	{onchange}
	bind:value
	class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600">
	{@render options()}
</select>
