<script>
	let {
		icon = undefined,
		titre,
		description = undefined,
		onclick,
		buttonText,
		className = ''
	} = $props();
</script>

<div class="text-center {className}">
	{#if icon}
		{@render icon("mx-auto size-12 text-gray-400")}
	{:else}
		<svg
			class="mx-auto size-12 text-gray-400"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-hidden="true">
			<path
				vector-effect="non-scaling-stroke"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
		</svg>
	{/if}
	<h3 class="mt-2 text-sm font-semibold text-gray-900">{titre}</h3>
	{#if description}
		<p class="mt-1 text-sm text-gray-500">{description}</p>
	{/if}
	<div class="mt-6">
		<button
			{onclick}
			type="button"
			class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
			<svg
				class="mr-1.5 -ml-0.5 size-5"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
				data-slot="icon">
				<path
					d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
			</svg>
			{buttonText}
		</button>
	</div>
</div>
