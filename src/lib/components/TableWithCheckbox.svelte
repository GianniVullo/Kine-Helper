<script>
	let { titre, description, actions, header, body, rows } = $props();
</script>

<div class="px-4 sm:px-6 lg:px-8">
	<div class="sm:flex sm:items-center">
		<div class="sm:flex-auto">
			<h1 class="text-base font-semibold text-gray-900">{titre}</h1>
			<p class="mt-2 text-sm text-gray-700">
				{description}
			</p>
		</div>
		<div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
			{@render actions?.()}
		</div>
	</div>
	<div class="mt-8 flow-root">
		<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
			<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
				<div class="relative">
					<!-- Selected row actions, only show when rows are selected. -->
					<!-- <div class="absolute top-0 left-14 flex h-12 items-center space-x-3 bg-white sm:left-12"> -->
					<!--   <button type="button" class="inline-flex items-center rounded-sm bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white">Bulk edit</button> -->
					<!--   <button type="button" class="inline-flex items-center rounded-sm bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white">Delete all</button> -->
					<!-- </div> -->

					<table class="min-w-full table-fixed divide-y divide-gray-300">
						<thead>
							<tr>
								{@render header()}
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#if body}
								{@render body()}
							{:else}
								<!-- Selected: "bg-gray-50" -->
								<!-- Selected: "text-indigo-600", Not Selected: "text-gray-900" -->
								{#each rows as { row_id, row, selected }, index}
									<tr>
										<td class="relative px-7 sm:w-12 sm:px-6">
											<!-- Selected row marker, only show when row is selected. -->
											<!-- <div class="absolute inset-y-0 left-0 w-0.5 bg-indigo-600"></div> -->
											<div class="group absolute top-1/2 left-4 -mt-2 grid size-4 grid-cols-1">
												<input
													type="checkbox"
													class="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto" />
												<svg
													class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
													viewBox="0 0 14 14"
													fill="none">
													<path
														class="opacity-0 group-has-checked:opacity-100"
														d="M3 8L6 11L11 3.5"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round" />
													<path
														class="opacity-0 group-has-indeterminate:opacity-100"
														d="M3 7H11"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round" />
												</svg>
											</div>
										</td>
									</tr>
								{/each}
							{/if}

							<!-- More people... -->
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>
