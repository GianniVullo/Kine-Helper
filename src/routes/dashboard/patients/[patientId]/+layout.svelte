<script>
	import Title from '$lib/patient-detail/Title.svelte';
	import Arborescence from '../../../../lib/patient-detail/Arborescence.svelte';
	import { patients, SituationPathologique } from '../../../../lib/stores/PatientStore';
	import { page } from '$app/stores';
	import DBAdapter from '$lib/forms/actions/dbAdapter';
	import { tick } from 'svelte';

	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	let loading = makeSpGreatAgain($page);
	let loadingInProgress = false;
	page.subscribe((p) => {
		// On check ici parce que sinon il run page.subscribe même lorsque l'on quitte la page
		if (p.params.patientId && p.params.spId && !loadingInProgress) {
			loading = makeSpGreatAgain(p);
		}
	});

	function makeSpGreatAgain(p) {
		return new Promise(async (resolve) => {
			await tick();
			loadingInProgress = true;
			console.log('in makeSpGreatAgain with', p);
			if (p.params.spId) {
				const spBeforeCheck = patient.situations_pathologiques.find(
					(sp) => sp.sp_id === p.params.spId
				);
				if (spBeforeCheck?.upToDate === false) {
					let db = new DBAdapter();
					let completedSp = await db.retrieve_sp(spBeforeCheck.sp_id);
					console.log('completedSp', completedSp);
					completedSp = new SituationPathologique(completedSp.data);
					completedSp.upToDate = true;
					patients.update((p) => {
						let patientIndex = p.findIndex((p) => p.patient_id === patient.patient_id);
						let spIndex = p[patientIndex].situations_pathologiques.findIndex(
							(sp) => sp.sp_id === completedSp.sp_id
						);
						p[patientIndex].situations_pathologiques[spIndex] = completedSp;
						return p;
					});
					loadingInProgress = false;
					resolve();
				} else {
					loadingInProgress = false;
					resolve();
				}
			} else {
				loadingInProgress = false;
				resolve();
			}
		});
	}

	let spPromied = new Promise((resolve) => {
		if (patient.situations_pathologiques.length == 0) {
			patients.getLastSpAndOthers(patient.patient_id).then(() => {
				resolve();
			});
		} else {
			resolve();
		}
	});

	console.log(patient);
</script>

{#if patient}
	{#await spPromied}
		CHARGEMENT...
	{:then value}
		<div class="flex h-full w-full flex-col items-start justify-start">
			<Title {patient} />
			{#key loading}
				{#await loading}
					Chargement ...
					<div
						style="margin: 4px;"
						class="h-5 w-5 animate-spin rounded-full border-2 border-secondary-500 border-b-primary-500 text-4xl">
					</div>
				{:then _}
					<div class="flex h-full w-full flex-col md:flex-row">
						<Arborescence {patient} />
						<slot />
					</div>
				{/await}
			{/key}
		</div>
	{/await}
{:else}
	Patient n'existe pas
{/if}
