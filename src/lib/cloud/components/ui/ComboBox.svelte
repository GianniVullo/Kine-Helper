<script>
	let {
		options,
		label,
		placeholder,
		onItemClick,
		oninput,
		className,
		showOptions = $bindable()
	} = $props();
</script>

<div class={className}>
	<label for="combobox" class="block text-sm/6 font-medium text-gray-900">{label}</label>
	<div class="relative mt-2">
		<input
			id="combobox"
			type="text"
			{placeholder}
			oninput={(e) => {
				if (!showOptions && e.target.value?.length > 0) {
					showOptions = true;
				}
				oninput(e);
			}}
			class="block w-full rounded-md bg-white py-1.5 pr-12 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
			role="combobox"
			aria-controls="options"
			aria-expanded="false" />
		<button
			type="button"
			aria-label="Toggle options"
			onclick={() => (showOptions = !showOptions)}
			class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-hidden">
			<svg
				class="size-5 text-gray-400"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
				data-slot="icon">
				<path
					fill-rule="evenodd"
					d="M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Zm-4.31 9.81 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z"
					clip-rule="evenodd" />
			</svg>
		</button>

		<ul
			class={[
				'absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden sm:text-sm',
				!showOptions && 'hidden'
			]}
			id="options"
			role="listbox">
			<!--
          Combobox option, manage highlight styles based on mouseenter/mouseleave and keyboard navigation.
  
          Active: "text-white bg-indigo-600 outline-hidden", Not Active: "text-gray-900"
        -->
			{#each options as option}
				<li class="flex flex-col">
					<button
						class="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none hover:bg-indigo-600 hover:text-white hover:outline-hidden"
						id="option-0"
						role="option"
						onclick={(e) => {
							onItemClick(option);
							showOptions = false;
						}}
						aria-selected={option.selected ? 'true' : 'false'}
						tabindex="-1">
						<div class="flex items-center">
							{#if option.src}
								<img src={option.src} alt="" class="size-6 shrink-0 rounded-full" />
							{:else}
								<div
									class="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-400">
									<p class="text-xs">{option.placeholder}</p>
								</div>
							{/if}
							<!-- Selected: "font-semibold" -->
							<span class={['ml-3 truncate', option.selected && 'font-semibold']}
								>{option.label}</span>
						</div>
						<!--
                                    Checkmark, only display for selected option.
                                    Active: "text-white", Not Active: "text-indigo-600"
                                  -->
						{#if option.selected}
							<span
								class="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-hover:text-white">
								<svg
									class="size-5"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
									data-slot="icon">
									<path
										fill-rule="evenodd"
										d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
										clip-rule="evenodd" />
								</svg>
							</span>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	</div>
</div>
