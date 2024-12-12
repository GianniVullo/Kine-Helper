<script module>
	export { iconBadge };
</script>

{#snippet iconBadge(
	inner,
	icon,
    color
)}
	<span class="inline-flex items-center gap-x-1.5 rounded-md bg-{color}-100 px-2 py-1 text-xs font-medium text-{color}-700">
		{#if icon}
			{@render icon(cls)}
		{:else}
			<svg class="size-1.5 fill-{color}-500" viewBox="0 0 6 6" aria-hidden="true">
				<circle cx="3" cy="3" r="3" />
			</svg>
		{/if}
		{inner}
	</span>
{/snippet}
