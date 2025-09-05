<script>
	import SimpleSelect from './forms/fields/SimpleSelect.svelte';
	import { page } from '$app/state';
	import { terminal } from 'virtual:terminal';
	import { goto } from '$app/navigation';

	let { titre, soustitre, actions, tabs, className, ...rest } = $props();
</script>

<div class={['relative w-full border-b border-gray-200 pb-5 sm:pb-0', className]}>
	<div class="md:flex md:items-center md:justify-between">
		<div class="flex flex-col">
			<h3 class="text-base font-semibold text-gray-900">{titre}</h3>
			{#if soustitre}
				<p class="mt-1 text-sm text-gray-500">{soustitre}</p>
			{/if}
		</div>
		{#if actions}
			<div class="mt-3 flex md:absolute md:top-3 md:right-0 md:mt-0">
				{@render actions()}
			</div>
		{/if}
	</div>
	<div class="mt-4">
		<div class="grid grid-cols-1 sm:hidden">
			<SimpleSelect
				id={rest.selectId}
				ariaLabel="Select a tab"
				value={$state.snapshot(page.url.pathname)}
				onchange={(e) => {
					terminal.log('select changed', e.target.value);
					goto(e.target.value);
				}}
				options={tabs}>
			</SimpleSelect>
		</div>
		<!-- Tabs at small breakpoint and up -->
		<div class="hidden sm:block">
			<nav class="-mb-px flex space-x-8">
				<!-- Current: "border-indigo-500 text-indigo-600", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" -->
				{#each tabs as { value: href, label: nom, actif, onclick }}
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
