<script>
	let {
		id,
		name,
		placeholder,
		className,
		error,
		leading,
		removeArrows = false,
		trailing,
		inputType,
		help,
		readonly = false,
		value = $bindable(),
		constraints
	} = $props();
</script>

<div class="mt-2 {inputType !== 'textarea' ? 'relative rounded-md shadow-sm' : ''}">
	{#if leading}
		<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
			{@render leading()}
		</div>
	{/if}
	{#if inputType === 'textarea'}
		<textarea
			{id}
			{name}
			rows="3"
			{placeholder}
			class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm/6 {error
				? 'pr-10 text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500'
				: 'text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600'}"
			bind:value
			{...constraints}
		></textarea>
	{:else}
		<input
			{id}
			{name}
			type={inputType}
			disabled={readonly}
			{readonly}
			class:pl-7={leading}
			class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm/6 {error
				? 'pr-10 text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500'
				: 'text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600'} {removeArrows
				? '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
				: ''}"
			aria-invalid={error ? 'true' : undefined}
			{placeholder}
			bind:value
			{...constraints}
		/>
	{/if}
	{#if error}
		<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
			<svg
				class="size-5 text-red-500"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
				data-slot="icon"
			>
				<path
					fill-rule="evenodd"
					d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
	{:else if trailing}
		<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
			{@render trailing()}
		</div>
	{/if}
</div>
{#if error}
	<p class="mt-2 text-sm text-red-600" id={`${name}-error`}>{error}</p>
{/if}
{#if help}
	<p class="mt-3 text-sm/6 text-gray-600">{help}</p>
{/if}
