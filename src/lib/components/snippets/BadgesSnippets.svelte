<script module>
	export { iconBadge };
</script>

{#snippet iconBadge(inner, icon, color, cls)}
	<span
		class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium {color ===
		'red'
			? 'bg-red-100 text-red-700'
			: 'bg-green-100 text-green-700'}">
		{#if icon}
			{@render icon("size-4")}
		{:else}
			<svg class="size-1.5 fill-{color}-500" viewBox="0 0 6 6" aria-hidden="true">
				<circle cx="3" cy="3" r="3" />
			</svg>
		{/if}
		{inner}
	</span>
{/snippet}
