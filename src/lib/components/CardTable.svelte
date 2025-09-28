<script>
	let { header, body, headerItems, bodyItems, onclick } = $props();
</script>

<div class="w-full">
	<div class="mt-8 flow-root">
		<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
			<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
				<div
					class="shadow ring-1 ring-black/5 sm:rounded-lg dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
					<table class="min-w-full divide-y divide-gray-300 dark:divide-white/15">
						<thead class="bg-gray-50 dark:bg-gray-800/75 dark:text-gray-200 text-gray-900">
							<tr>
								{#if header}
									{@render header()}
								{:else}
									{#each headerItems as item}
										<th
											scope="col"
											class="py-3.5 pr-3 text-left text-sm font-semibold first:pl-4 sm:pl-0"
											>{@html item}</th>
									{/each}
								{/if}
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white  dark:divide-white/10 dark:bg-gray-800/50 text-gray-900 sm:pl-6 dark:text-white">
							{#if body}
								{@render body()}
							{:else}
								{#each bodyItems as item}
									<tr onclick={() => onclick(item)} class="cursor-pointer">
										{#each item as { className, content, snippet }}
											<td class={['py-5 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-0', className]}>
												{#if snippet}
													{@render snippet()}
												{:else}
													{@html content}
												{/if}
											</td>
										{/each}
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>
