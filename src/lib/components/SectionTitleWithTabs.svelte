<script>
	import Tabs from './Tabs.svelte';

	let { titre, soustitre, actions, tabs, className, ...rest } = $props();
</script>

<div
	style={rest.style}
	class={[
		'relative flex w-full flex-col justify-between border-b border-gray-200 dark:border-gray-700',
		className
	]}>
	<div class="md:flex md:items-start md:justify-between">
		<div class="flex flex-col">
			<h3 class="text-base font-semibold text-gray-900 dark:text-white">{titre}</h3>
			{#if soustitre}
				<p class="mt-1 text-sm text-gray-500">{soustitre}</p>
			{/if}
		</div>
		{#if actions}
			<div class="mt-3 flex md:mt-0">
				{@render actions()}
			</div>
		{/if}
	</div>
	<div class="mt-4">
		<Tabs {tabs} className={rest.tabsClassName} />
	</div>
</div>
