<script>
	import { fly } from 'svelte/transition';
	import { toast } from './notificationUtilities.svelte';
</script>

<!-- Global notification live region, render this permanently at the end of the document -->
<div
	aria-live="assertive"
	class="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6">
	<div class="flex w-full flex-col items-center space-y-4 sm:items-end">
		<!--
        Notification panel, dynamically insert this into the live region when it needs to be displayed
  
        Entering: "transform ease-out duration-300 transition"
          From: "translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          To: "translate-y-0 opacity-100 sm:translate-x-0"
        Leaving: "transition ease-in duration-100"
          From: "opacity-100"
          To: "opacity-0"
      -->
		{#each toast.fired as component (component.id)}
			<div
				in:fly={{ duration: 500, x: 100 }}
				out:fly={{ duration: 300, delay: 0 }}
				class={[
					'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5 transition'
				]}>
				<div class="p-4">
					<div class="flex items-start">
						<div class="shrink-0">
							{@render component.leading?.(component.leadingCSS)}
						</div>
						<div class="ml-3 w-0 flex-1 pt-0.5">
							<p class="text-sm font-medium text-gray-900">{component?.title}</p>
							<p class="mt-1 text-sm text-gray-500">{@html component?.description}</p>
						</div>
						<div class="ml-4 flex shrink-0">
							<button
								type="button"
								class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
								onclick={() => {
									toast.close(component);
								}}>
								<span class="sr-only">Close</span>
								<svg
									class="size-5"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
									data-slot="icon">
									<path
										d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
