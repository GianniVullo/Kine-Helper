<script>
	let { icon, color, href, onclick, title, description, state } = $props();
</script>

<div
	class="group relative rounded-tl-lg rounded-tr-lg bg-white p-6 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-inset sm:rounded-tr-none">
	<div>
		<span class={['inline-flex rounded-lg ring-4 ring-white', color]}>
			{@render icon('size-6')}
		</span>
	</div>
	<div class="mt-8">
		<h3 class="text-base font-semibold text-gray-900">
			{#if onclick}
				<a {href} class="focus:outline-hidden">
					<!-- Extend touch target to entire panel -->
					<span class="absolute inset-0" aria-hidden="true"></span>
					{title}
				</a>
			{:else}
				<button {onclick} class="focus:outline-hidden">
					<!-- Extend touch target to entire panel -->
					<span class="absolute inset-0" aria-hidden="true"></span>
					{title}
				</button>
			{/if}
		</h3>
		<p class="mt-2 text-sm text-gray-500">
			{description}
		</p>
	</div>
	<!-- Todo The state here must be : completed or yet-to-be-completed  -->
	<span
		class="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
		aria-hidden="true">
		<svg class="size-6" fill="currentColor" viewBox="0 0 24 24">
			<path
				d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
		</svg>
	</span>
</div>
