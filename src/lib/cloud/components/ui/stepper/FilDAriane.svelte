<script>
	let { steps, currentStep = $bindable() } = $props();
</script>

{#if typeof steps[0] === 'object' && steps.length > 0}
	<!-- Fil d'Ariane avec titres et descriptions -->
	<nav aria-label="Progress">
		<ol role="list" class="space-y-4 md:flex md:space-y-0 md:space-x-8">
			<li class="md:flex-1">
				<!-- Completed Step -->
				<a
					href="#"
					class="group flex flex-col border-l-4 border-indigo-600 py-2 pl-4 hover:border-indigo-800 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0">
					<span class="text-sm font-medium text-indigo-600 group-hover:text-indigo-800"
						>Step 1</span>
					<span class="text-sm font-medium">Job details</span>
				</a>
			</li>
			<li class="md:flex-1">
				<!-- Current Step -->
				<a
					href="#"
					class="flex flex-col border-l-4 border-indigo-600 py-2 pl-4 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0"
					aria-current="step">
					<span class="text-sm font-medium text-indigo-600">Step 2</span>
					<span class="text-sm font-medium">Application form</span>
				</a>
			</li>
			<li class="md:flex-1">
				<!-- Upcoming Step -->
				<a
					href="#"
					class="group flex flex-col border-l-4 border-gray-200 py-2 pl-4 hover:border-gray-300 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0">
					<span class="text-sm font-medium text-gray-500 group-hover:text-gray-700">Step 3</span>
					<span class="text-sm font-medium">Preview</span>
				</a>
			</li>
		</ol>
	</nav>
{:else}
	<!-- Fil d'ariane sans titres ni descriptions -->
	<nav class="flex items-center justify-center" aria-label="Progress">
		<p class="text-sm font-medium">Step {currentStep + 1} of {steps.length}</p>
		<ol role="list" class="ml-8 flex items-center space-x-5">
			{#each steps as item, i}
				{#if i < currentStep}
					<li>
						<!-- Completed Step -->
						<button
							onclick={() => {
								currentStep = i;
							}}
							class="block size-2.5 rounded-full bg-indigo-600 hover:bg-indigo-900">
							<span class="sr-only">Étape {i + 1}</span>
						</button>
					</li>
				{/if}
			{/each}
			<li>
				<!-- Current Step -->
				<a href="#" class="relative flex items-center justify-center" aria-current="step">
					<span class="absolute flex size-5 p-px" aria-hidden="true">
						<span class="size-full rounded-full bg-indigo-200"></span>
					</span>
					<span class="relative block size-2.5 rounded-full bg-indigo-600" aria-hidden="true"
					></span>
					<span class="sr-only">Step 2</span>
				</a>
			</li>
			<li>
				<!-- Upcoming Step -->
				<a href="#" class="block size-2.5 rounded-full bg-gray-200 hover:bg-gray-400">
					<span class="sr-only">Step 3</span>
				</a>
			</li>
			<li>
				<!-- Upcoming Step -->
				<a href="#" class="block size-2.5 rounded-full bg-gray-200 hover:bg-gray-400">
					<span class="sr-only">Step 4</span>
				</a>
			</li>
		</ol>
	</nav>
{/if}
