<script>
    let { titre, actions, className } = $props();
</script>

<div class="border-b border-gray-200 dark:border-gray-700 pb-5 sm:flex sm:items-center sm:justify-between w-full">
	<h3 class="text-base font-semibold text-gray-900 dark:text-white">{titre}</h3>
	<div class="mt-3 flex sm:ml-4 sm:mt-0 {className}">
		{@render actions()}
	</div>
</div>
