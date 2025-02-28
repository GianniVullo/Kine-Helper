<script>
	let {
		id,
		name,
		placeholder,
		className,
		error,
		leading,
		leadingCSS,
		removeArrows = false,
		trailing,
		inputType,
		help,
		readonly = false,
		value = $bindable(),
		checkboxLabel = undefined,
		onchange,
		checkboxDescription = undefined,
		constraints
	} = $props();
</script>

<div class="mt-2 {inputType !== 'textarea' ? 'relative rounded-md shadow-sm' : ''}">
	{#if leading}
		<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1">
			{@render leading(leadingCSS)}
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
			{...constraints}></textarea>
	{:else if inputType === 'checkbox'}
		<div class="flex gap-3">
			<div class="flex h-6 shrink-0 items-center">
				<div class="group grid size-4 grid-cols-1">
					<input
						{id}
						aria-describedby="{name}-description"
						{name}
						type="checkbox"
						bind:checked={value}
						class="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto" />
					<svg
						class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
						viewBox="0 0 14 14"
						fill="none">
						<path
							class="opacity-0 group-has-[:checked]:opacity-100"
							d="M3 8L6 11L11 3.5"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round" />
						<path
							class="opacity-0 group-has-[:indeterminate]:opacity-100"
							d="M3 7H11"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round" />
					</svg>
				</div>
			</div>
			<div class="text-sm/6">
				<label for={id} class="font-medium text-gray-900">{checkboxLabel}</label>
				{#if checkboxDescription}
					<p id="{name}-description" class="text-gray-500">
						{@html checkboxDescription}
					</p>
				{/if}
			</div>
		</div>
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
			{onchange} />
	{/if}
	{#if error}
		<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
			<svg
				class="size-5 text-red-500"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
				data-slot="icon">
				<path
					fill-rule="evenodd"
					d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
					clip-rule="evenodd" />
			</svg>
		</div>
	{:else if trailing}
		<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
			{@render trailing()}
		</div>
	{/if}
</div>
{#if error}
	<p class="mt-2 text-sm text-red-600" id={`${name}-error`}>{@html error}</p>
{/if}
{#if help}
	<p class="mt-3 text-sm/6 text-gray-600">{help}</p>
{/if}
