<script>
	import { t } from '../../../../lib/i18n';
	// import Arborescence from '../../../../lib/patient-detail/Arborescence.svelte';
	import { patients } from '../../../../lib/stores/PatientStore';
	import { page } from '$app/stores';
	import {
		retrieveLastSPWithRelatedObjectsPlusOlderSPWithoutRelatedObjects,
		retrieveSituationPathologique
	} from '../../../../lib/user-ops-handlers/situations_pathologiques';
	import Breadcrumbs from '../../../../lib/patient-detail/Breadcrumbs.svelte';

	/**
	 ** Ici, comme nous entrons dans une page de détails d'un patient il est nécessaire de récupérer la première situation pathologique en entier + un descriptif succinct de toutes les autres.
	 ** Ce morcellement est important car une sp peut contenir vrmt BCP d'informations.
	 *
	 *
	 ** Il y a 3 cas de figures :
	 *
	 **		- Le patient n'a pas encore été exploré par l'utilisasteur et il n'a donc pas du tout de SP disponible à l'analyse => getLastSpAndOthers
	 *
	 **		- Le patient a été exploré et l'on accède à une sp qui n'est pas uptodate => On doit télécharger la sp
	 *
	 **		- Le patient a été exploré et l'on accède à une sp uptodate => On ne fait rien
	 *
	 *
	 ** Nous regrouperons tous ces cas de figure dans une promesse qui évaluera et effectuera les opérations nécessaires lorsque la page de détails du patient est demandée par l'utilisateur
	 */
	let { children } = $props();
	const patient = $derived($patients.find((p) => p.patient_id === $page.params.patientId));
	//? derived is here to update the breadcrumbs of the patient title
	let currentSp = $derived(
		patient.situations_pathologiques.find((s) => s.sp_id === $page.params.spId)
	);
	// loadingInProgress est là pour s'assurer qu'on empêche jamais isUptoDate de terminer son action
	let loadingInProgress = false;
	let isSpUpToDate = $state(new Promise(evaluerEtEffectuerLesOperationsNecessaires));

	async function evaluerEtEffectuerLesOperationsNecessaires(resolve, reject) {
		loadingInProgress = true;
		/**
		 * Voilà la promesse qui évalue les actions nécessaire au bon affichage des données patients et les effectues
		 *
		 ** Cas numéro 1 : Le patient est exploré pour la première fois
		 * TODO Attention que dans ce cas ci il y a un cas embêtants où un patient n'a pas de SP créée encore et risque de déclencher à chaque fois getLastSpAndOthers. Pour l'instant je choisi d'ignorer le problème car à priori un patient n'est pas fait pour rester sans situations pathologiques ET en plus le coût pour le serveur est faible
		 */
		if (patient.situations_pathologiques.length == 0) {
			await retrieveLastSPWithRelatedObjectsPlusOlderSPWithoutRelatedObjects({
				patient_id: patient.patient_id
			});
			loadingInProgress = false;
			resolve(); // resolve(void) parce qu'on utilise des stores et pas les données directement (à la fois pour la réactivité et la mise en cache offerte)
		}
		// cette variable sp permet à la promesse de déterminer si c'est un cas 2 ou 3
		let sp = patient.situations_pathologiques[0];
		console.log('THE SP : ', sp);

		/**
		 ** Cas numéro 2 : Le patient a été exploré et l'on accède à une sp qui n'est pas uptodate
		 */
		if (sp?.upToDate === false) {
			await retrieveSituationPathologique({
				sp_id: sp.sp_id,
				patient_id: patient.patient_id
			});
			loadingInProgress = false;
			resolve();
		}
		/**
		 ** Cas numéro 3 : Le patient a été exploré et l'on accède à une sp uptodate
		 */
		if (sp?.upToDate) {
			loadingInProgress = false;
			resolve();
		}
		loadingInProgress = false;
		reject('La situation pathologique est introuvable.');
	}

	$effect(() => {
		if ($page.params.patientId && $page.params.spId && !loadingInProgress) {
			isSpUpToDate = new Promise(evaluerEtEffectuerLesOperationsNecessaires);
		}
	});

	// page.subscribe((p) => {
	// 	console.log('Réévaluation de la situation pathologique suite à une navigation');
	// 	if (p.params.patientId && p.params.spId && !loadingInProgress) {
	// 		isSpUpToDate = new Promise(evaluerEtEffectuerLesOperationsNecessaires);
	// 	}
	// });
</script>

{#if patient}
	{#await isSpUpToDate}
		{$t('shared', 'loading')}
	{:then _}
		<div class="flex h-full w-full flex-col items-start justify-start">
			<Breadcrumbs {currentSp} {patient} />
			{@render children()}
			<!-- <div class="flex h-full w-full flex-col md:flex-row">
					<Arborescence {patient} />
					<div class="w-full overflow-y-scroll"><slot /></div>
				</div> -->
		</div>
	{:catch error}
		Erreur : {error}
	{/await}
{:else}
	{$t('patients.detail', '404')}
{/if}
