<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Select from './form/Select.svelte';
	let { tabs, className } = $props();
</script>

<div class="mb-10 {className}">
	<div class="grid grid-cols-1 sm:hidden">
		<!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
		<Select
			ariaLabel="Select a tab"
			onchange={(e) => {
				goto(e.target.value);
			}}>
			{#snippet options()}
				{#each tabs as { href, nom }}
					<option value={href} selected={$page.url.pathname === href}>{nom}</option>
				{/each}
			{/snippet}
		</Select>
	</div>
	<div class="hidden sm:block">
		<nav class="flex space-x-4" aria-label="Tabs">
			<!-- Current: "bg-indigo-100 text-indigo-700", Default: "text-gray-500 hover:text-gray-700" -->
			{#each tabs as { href, nom, actif }}
				<a
					{href}
					class="rounded-md px-3 py-2 text-sm font-medium {actif
						? 'bg-indigo-100 text-indigo-700'
						: 'text-gray-500 hover:text-gray-700'}">{nom}</a>
			{/each}
		</nav>
	</div>
</div>
