<script>
	import { platform } from '@tauri-apps/plugin-os';
	import { terminal } from 'virtual:terminal';

	let {
		label,
		options,
		name,
		value = $bindable(),
		placeholder,
		onchange,
		readonly = false,
		id = 'location'
	} = $props();
</script>

<div>
	<label for="location" class="block text-sm/6 font-medium text-gray-900">{label}</label>
	<div class="mt-2 grid grid-cols-1">
		<select
			{id}
			{name}
			{onchange}
			disabled={readonly}
			bind:value
			class="focus:outline-secondary-600 col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6">
			{#if placeholder}
				<option value="" disabled selected>{placeholder}</option>
			{/if}
			{#each options as option}
				<option value={option?.value} selected={option?.value === value}>{option?.label}</option>
			{/each}
		</select>
		{#if platform() !== 'macos' && platform() !== 'ios'}
			<svg
				class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
				viewBox="0 0 16 16"
				fill="currentColor"
				aria-hidden="true"
				data-slot="icon">
				<path
					fill-rule="evenodd"
					d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
					clip-rule="evenodd" />
			</svg>
		{/if}
	</div>
</div>
