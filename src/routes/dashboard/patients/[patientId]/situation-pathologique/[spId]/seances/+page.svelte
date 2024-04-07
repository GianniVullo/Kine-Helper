<script>
	import { NomenclatureArchitecture } from '../../../../../../../lib/utils/nomenclatureManager';
	import DBAdapter from '../../../../../../../lib/forms/actions/dbAdapter';
	import { patients } from '../../../../../../../lib/stores/PatientStore';
	import { page } from '$app/stores';
	import dayjs from 'dayjs';
	import { DBInitializer } from '../../../../../../../lib/stores/databaseInitializer';

	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	const sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
	const nomenclature = new NomenclatureArchitecture(patient, sp);
	console.log('nomenclature', nomenclature);
	const codes = new DBAdapter().list('codes', [
		['convention_id', '3ba16c31-d8c3-4f07-a5ed-9148dfcccf8f']
	]);
	console.log('codes', codes);
</script>

<!--* ok donc mtn on a enfin notre architecture de construite -->
<!--* Il faut maintenant un manipulateur de séance qui permet de gérer les mouvements des prestations au sein d'une sp  -->

<section class="h-[80vh]">
	{#await codes}
		Chargement des codes
	{:then value}
		<h1>
			This page is here, at the moment, only to allow me to debug my new "algorithms". Who knows,
			soon enough will here be some usefull functionnality to help us manage our sessions!
		</h1>
		<div class="flex flex-col">
			<div class="flex items-center justify-start">
				{#each [...nomenclature.architecture(value.data)[0], ...nomenclature.architecture(value.data)[1]] as code, idx}
					<div
						class="relative flex min-h-20 min-w-60 flex-col border border-rose-50 bg-secondary-500 py-3">
						<p class="absolute right-1 top-1">{idx + 1}</p>
						<!--* bloc -->
						<h5>{code.code_reference}</h5>
					</div>
				{/each}
			</div>
			<div class="flex">
				{#each sp.seances as seance, i}
					<div class="flex min-h-20 min-w-60 flex-col border border-rose-50 bg-surface-500 py-3">
						<!--* bloc -->
						<h5>{dayjs(seance.date).format('DD/MM/YYYY')}</h5>
						{#await new Promise(async (resolve) => {
							let db = await new DBInitializer().openDBConnection();
							let code = await db.select( 'SELECT * FROM codes WHERE code_id = $1', [seance.code_id] );
							console.log(code);
							resolve(code[0]);
						}) then code}
							{code.code_reference}
						{/await}
					</div>
					<div class="size-28 bg-surface-400"></div>
				{/each}
			</div>
		</div>
	{/await}
</section>
