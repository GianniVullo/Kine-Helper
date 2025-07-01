<script>
	import { platform } from '@tauri-apps/plugin-os';

	let { group = $bindable(), label, description, outerCSS, options, error } = $props();
</script>

<fieldset class={outerCSS}>
	<legend class="text-sm/6 font-semibold text-gray-900">{label}</legend>
	{#if description}
		<p class="mt-1 text-sm/6 text-gray-600">{description}</p>
	{/if}
	<div class="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-10 sm:gap-x-4">
		{#each options as { id: innerId, name, value, label, description, footer, className }}
			{@const id = innerId ?? crypto.randomUUID()}
			<label
				aria-label={label}
				aria-description={description}
				class={["group relative flex rounded-lg border border-gray-300 bg-white p-4 has-checked:outline-2 has-checked:-outline-offset-2 has-checked:outline-indigo-600 has-focus-visible:outline-3 has-focus-visible:-outline-offset-1", className]}>
				<input
					type="radio"
					{name}
					{value}
					bind:group
					{id}
					class={{
						'absolute inset-0 appearance-none focus:outline-none': true,
						'appearance-none': platform() !== 'macos',
						'sr-only': platform() === 'macos'
					}} />
				<span class="flex flex-1">
					<span class="flex flex-col">
						<span class="block text-sm font-medium text-gray-900">{label}</span>
						<span class="mt-1 flex items-center text-sm text-gray-500">{@html description}</span>
						{#if footer}
							<span class="mt-6 text-sm font-medium text-gray-900">{@html footer}</span>
						{/if}
					</span>
				</span>
				<svg
					class="invisible size-5 text-indigo-600 group-has-checked:visible"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
					data-slot="icon">
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
						clip-rule="evenodd" />
				</svg>
			</label>
		{/each}
	</div>

	{#if error}
		<p class="mt-2 text-sm text-red-600" id={`${name}-error`}>{@html error}</p>
	{/if}
</fieldset>
