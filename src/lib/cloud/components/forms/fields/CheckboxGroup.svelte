<script>
	let { group = $bindable(), options, label } = $props();
    console.log('group', group);
    console.log('options', options);
    console.log('label', label);
</script>

<fieldset>
	<legend class="sr-only">{label}</legend>
	<div class="space-y-5">
		{#each options as { id, name, label, description }}
			<div class="flex gap-3">
				<div class="flex h-6 shrink-0 items-center">
					<div class="group grid size-4 grid-cols-1">
						<input
							{id}
							aria-describedby={`${name}-description`}
							{name}
							type="checkbox"
							value={id}
							bind:group
							class="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto" />
						<svg
							class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
							viewBox="0 0 14 14"
							fill="none">
							<path
								class="opacity-0 group-has-checked:opacity-100"
								d="M3 8L6 11L11 3.5"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round" />
							<path
								class="opacity-0 group-has-indeterminate:opacity-100"
								d="M3 7H11"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round" />
						</svg>
					</div>
				</div>
				<div class="text-sm/6">
					<label for={id} class="font-medium text-gray-900">{label}</label>
					<span id={`${name}-description`} class="text-gray-500"
						><span class="sr-only">{label}</span>{description}</span>
				</div>
			</div>
		{/each}
	</div>
</fieldset>
