<script>
	let {
		trigger = null,
		triggerText = 'Options',
		triggerIcon = null,
		triggerClass = '',
		customTrigger,
		position = 'bottom-end',
		width = 'w-56',
		items = [],
		isOpen = $bindable(false),
		onOpenChange = null,
		disabled = false,
		children,
		...restProps
	} = $props();

	const positionMap = {
		'bottom-start': 'bottom start',
		'bottom-end': 'bottom end',
		'bottom-center': 'bottom',
		'top-start': 'top start',
		'top-end': 'top end',
		'top-center': 'top',
		left: 'left',
		right: 'right'
	};

	const dropdownItemClasses =
		'group/item flex items-center px-4 py-2 text-sm text-gray-700 focus:bg-gray-100 focus:text-gray-900 focus:outline-hidden dark:text-gray-300 dark:focus:bg-white/5 dark:focus:text-white';

	const dropdownItemIconClasses =
		'mr-3 size-5 text-gray-400 group-focus/item:text-gray-500 dark:text-gray-500 dark:group-focus/item:text-white';
</script>

{#snippet dropdownItem({ href, onclick, icon, actionCSS, ...rest })}
	{#if href}
		<a {href} class={[dropdownItemClasses, actionCSS]}>
			{#if icon}
				{@render icon(dropdownItemIconClasses, 'icon')}
			{/if}
			<p class="">{rest.label}</p>
		</a>
	{:else}
		<button {onclick} class={['w-full', dropdownItemClasses, actionCSS]} {...rest}>
			{#if icon}
				{@render icon(dropdownItemIconClasses, 'icon')}
			{/if}
			<p class="">{rest.label}</p>
		</button>
	{/if}
{/snippet}

<el-dropdown class={restProps.className ?? 'inline-block'}>
	{#if customTrigger}
		{@render customTrigger()}
	{:else}
		<button
			class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20">
			{triggerText}
			{#if true}
				<svg
					viewBox="0 0 20 20"
					fill="currentColor"
					data-slot="icon"
					aria-hidden="true"
					class="-mr-1 size-5 text-gray-400 dark:text-gray-500">
					<path
						d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
						clip-rule="evenodd"
						fill-rule="evenodd" />
				</svg>
			{/if}
		</button>
	{/if}

	<el-menu
		anchor={positionMap[position]}
		popover
		class="w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg outline-1 outline-black/5 transition transition-discrete [--anchor-gap:--spacing(2)] data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:divide-white/10 dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
		{#each items as group, groupIndex (groupIndex)}
			<div class="py-1">
				{#each group as ddItem}
					{@render dropdownItem(ddItem)}
				{/each}
			</div>
		{/each}
	</el-menu>
</el-dropdown>
