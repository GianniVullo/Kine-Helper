<script>
	import { page } from '$app/state';
	import AccordForm from '../../../../../../../../lib/components/forms/AccordForm.svelte';
	// import ListeEForm from '../../../../../../../../lib/components/forms/ListeEForm.svelte';

	let { data } = $props();
	const { patient, sp } = data;
	const docType = page.params.docType;
	// let additionalParameters = $page.url.searchParams.get('attestationIds');
</script>

{#snippet title(titre)}
	<div class="mt-4 mb-12 min-w-0 flex-1">
		<h2 class="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
			{titre}
		</h2>
	</div>
{/snippet}

{#if docType === 'A' || docType === 'B'}
	{@render title(`Création d'une Annexe ${docType}`)}
	<AccordForm {patient} {sp} {docType} />
{:else if docType === 'E'}
	{@render title("Création d'une Demande pour Pathologies Lourdes")}
	<!-- Future implementation for Demande pour Pathologies Lourdes -->
	<!-- <ListeEForm /> -->
{:else}
	<p class="text-red-500">Type de document inconnu : {docType}</p>
{/if}
