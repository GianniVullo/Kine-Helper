<script>
	import Select from './form/Select.svelte';
	import { page } from '$app/stores';

	let { titre, soustitre, actions, tabs, className } = $props();
</script>

<div class={['relative w-full border-b border-gray-200 pb-5 sm:pb-0', className]}>
	<div class="md:flex md:items-center md:justify-between">
		<div class="flex flex-col">
			<h3 class="text-base font-semibold text-gray-900">{titre}</h3>
			{#if soustitre}
				<p class="mt-1 text-sm text-gray-500">{soustitre}</p>
			{/if}
		</div>
		<div class="mt-3 flex md:absolute md:top-3 md:right-0 md:mt-0">
			{@render actions()}
		</div>
	</div>
	<div class="mt-4">
		<div class="grid grid-cols-1 sm:hidden">
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
			<svg
				class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500"
				viewBox="0 0 16 16"
				fill="currentColor"
				aria-hidden="true"
				data-slot="icon">
				<path
					fill-rule="evenodd"
					d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
					clip-rule="evenodd" />
			</svg>
		</div>
		<!-- Tabs at small breakpoint and up -->
		<div class="hidden sm:block">
			<nav class="-mb-px flex space-x-8">
				<!-- Current: "border-indigo-500 text-indigo-600", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" -->
				{#each tabs as { href, nom, actif, onclick }}
					{#if onclick}
						<button
							class="border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap {actif
								? 'border-indigo-500 text-indigo-600'
								: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
							{onclick}>{nom}</button>
					{:else}
						<a
							{href}
							class="border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap {actif
								? 'border-indigo-500 text-indigo-600'
								: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
							>{nom}</a>
					{/if}
				{/each}
			</nav>
		</div>
	</div>
</div>
