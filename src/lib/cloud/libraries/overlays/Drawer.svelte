<script>
	let { opened, title, description, children } = $props();
</script>

<div class="relative z-10" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
	<!--
    Background backdrop, show/hide based on slide-over state.

    Entering: "ease-in-out duration-500"
      From: "opacity-0"
      To: "opacity-100"
    Leaving: "ease-in-out duration-500"
      From: "opacity-100"
      To: "opacity-0"
  -->
	<div
		class={[
			'fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out',
			!opened && 'pointer-events-none opacity-0',
			opened && 'opacity-100'
		]}
		aria-hidden="true">
	</div>

	<div class="pointer-events-none fixed inset-0 top-10 overflow-hidden md:top-0">
		<div class="absolute inset-0 overflow-hidden">
			<div class="pointer-events-none fixed top-12 right-0 bottom-0 flex max-w-full pl-10 lg:top-0">
				<!--
            Slide-over panel, show/hide based on slide-over state.
  
            Entering: "transform transition ease-in-out duration-500 sm:duration-700"
              From: "translate-x-full"
              To: "translate-x-0"
            Leaving: "transform transition ease-in-out duration-500 sm:duration-700"
              From: "translate-x-0"
              To: "translate-x-full"
          -->
				<div
					class={[
						'pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out sm:duration-700',
						!opened && 'translate-x-full',
						opened && 'translate-x-0'
					]}>
					<div id="right-drawer" class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
						<div class="bg-gray-50 px-4 py-6 sm:px-6">
							<div class="flex items-start justify-between space-x-3">
								<div class="space-y-1">
									<h2 class="text-base font-semibold text-gray-900" id="slide-over-title">
										{title}
									</h2>
									<p class="text-sm text-gray-500">
										{description}
									</p>
								</div>
								<div class="flex h-7 items-center">
									<button
										type="button"
										class="relative text-gray-400 hover:text-gray-500"
										onclick={() => {
											history.back();
										}}>
										<span class="absolute -inset-2.5"></span>
										<span class="sr-only">Close panel</span>
										<svg
											class="size-6"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											aria-hidden="true"
											data-slot="icon">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M6 18 18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							</div>
						</div>
						<div class="relative mt-6 flex-1 px-4 sm:px-6">
							{@render children()}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
