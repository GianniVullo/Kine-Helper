<script>
	let { title, actions, srOnly } = $props();
</script>

<div class="w-full rounded-lg bg-white">
	<h2 class="sr-only" id="profile-overview-title">{srOnly}</h2>
	<div class="bg-white p-6">
		<div class="sm:flex sm:items-center sm:justify-between">
			<!--* Title -->
            {@render title()}
			<!--* Actions -->
            {@render actions?.()}
		</div>
	</div>
</div>
