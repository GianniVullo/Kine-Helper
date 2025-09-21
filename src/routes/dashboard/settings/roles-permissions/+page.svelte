<script>
	import Card from '../../../../lib/components/Card.svelte';
	import { FormSection } from '../../../../lib/components/forms/blocks';
	import kineURL from '../../../../lib/assets/kine.png';
	import secretaireURL from '../../../../lib/assets/secretaire.png';
	import adminURL from '../../../../lib/assets/admin.png';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

{#snippet temporarySelect(selectedRole)}
	<!-- <label for="location" class="block text-sm/6 font-medium text-gray-900 dark:text-white"
		>Role</label> -->
	<div class="mt-2 grid grid-cols-1">
		<select
			id="location"
			name="location"
			class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus-visible:outline-indigo-500">
			<option selected={selectedRole === 'Kiné'}>Kiné</option>
			<option selected={selectedRole === 'Secrétaire'}>Secrétaire</option>
			<option selected={selectedRole === 'Administrateur'}>Administrateur</option>
		</select>
		<!-- <svg
			viewBox="0 0 16 16"
			fill="currentColor"
			data-slot="icon"
			aria-hidden="true"
			class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400">
			<path
				d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
				clip-rule="evenodd"
				fill-rule="evenodd" />
		</svg> -->
	</div>
{/snippet}

<FormSection titre="Membres">
	<Card className="col-span-full md:col-span-2">
		{#snippet body()}
			<img src={adminURL} alt="" />
		{/snippet}
		{#snippet footer()}
			<div class="flex w-full flex-col items-center justify-center text-center">
				<h2 class="font-medium">Gianni Vullo</h2>
				{@render temporarySelect('Administrateur')}
			</div>
		{/snippet}
	</Card>
	<Card className="col-span-full md:col-span-2">
		{#snippet body()}
			<img src={kineURL} alt="" />
		{/snippet}
		{#snippet footer()}
			<div class="flex w-full flex-col items-center justify-center text-center">
				<h2 class="font-medium">Alain Delon</h2>
				{@render temporarySelect('Kiné')}
			</div>
		{/snippet}
	</Card>
	<Card className="col-span-full md:col-span-2">
		{#snippet body()}
			<img src={secretaireURL} alt="" />
		{/snippet}
		{#snippet footer()}
			<div class="flex w-full flex-col items-center justify-center text-center">
				<h2 class="font-medium">Manon Moemaers</h2>
				{@render temporarySelect('Secrétaire')}
			</div>
		{/snippet}
	</Card>
</FormSection>
