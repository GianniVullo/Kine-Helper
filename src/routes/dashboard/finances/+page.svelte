<script>
	import BoutonPrincipal from '../../../lib/components/BoutonPrincipal.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<div class="md:flex md:items-center md:justify-between">
	<div class="min-w-0 flex-1">
		<h2 class="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
			Finances
		</h2>
	</div>
	<div class="mt-4 flex md:ml-4 md:mt-0">
		<!-- <button
			type="button"
			class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
			>Edit</button> -->
		<BoutonPrincipal
			className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			href="/dashboard/finances/tarifs-form"
			inner="Gérer vos tarifs" />
	</div>
</div>

<p class="mt-10">
	Bienvenue dans la page tarifs qui permet aux kinés déconventionnés de définir des tarifs
	personnalisés et aux kinés connventionné de définir des suppléments en cas de demandes horaires
	spéciales du patient (après 19h ou avant 7h).
</p>
