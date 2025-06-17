<script>
	let { steps, currentStep = $bindable(), goToStep } = $props();
</script>
	<!-- Fil d'Ariane avec titres et descriptions -->
	<nav aria-label="Progress">
		<ol role="list" class="space-y-4 md:flex md:space-y-0 md:space-x-8">
			{#each steps as { title, description, invalid }, i}
				{#if i < currentStep}
					<li class="md:flex-1">
						<!-- Completed Step -->
						<button
							onclick={() => {
								goToStep(i);
							}}
							class="group flex w-full flex-col border-l-4 border-indigo-600 py-2 pl-4 hover:border-indigo-800 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0">
							<span class="text-sm font-medium text-indigo-600 group-hover:text-indigo-800"
								>Étape {i + 1}</span>
							<span class="text-sm font-medium">{title}</span>
						</button>
					</li>
				{:else if i === currentStep}
					<li class="md:flex-1">
						<!-- Current Step -->
						<div
							href="#"
							class={[
								'flex flex-col border-l-4 py-2 pl-4 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0',
								invalid ? 'border-red-600' : 'border-indigo-600'
							]}
							aria-current="step">
							<span class={['text-sm font-medium', invalid ? 'text-red-600': 'text-indigo-600']}
								>Étape {i + 1}</span>
							<span class="text-sm font-medium">{title}</span>
						</div>
					</li>
				{:else}
					<li class="md:flex-1">
						<!-- Upcoming Step -->
						<button
							onclick={() => {
								console.log('Going to step:', i);
								goToStep(i);
							}}
							class="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 hover:border-gray-300 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0">
							<span class="text-sm font-medium text-gray-500 group-hover:text-gray-700"
								>Étape {i + 1}</span>
							<span class="text-sm font-medium">{title}</span>
						</button>
					</li>
				{/if}
			{/each}
		</ol>
	</nav>
