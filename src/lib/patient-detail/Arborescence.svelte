<script>
	import { page } from '$app/stores';
	import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import {
		FolderIcon,
		PageIcon,
		PlusIcon,
		ChevronDownIcon,
		ChevronRightIcon,
		ChevronLeftIcon,
		ChevronUpIcon
	} from '../ui/svgs/index';
	import { TreeView, TreeViewItem } from '@skeletonlabs/skeleton';
	import { DBAdapter } from '../forms';
	import { SituationPathologique, patients } from '../stores/PatientStore';

	export let patient;
	const homeUrl = () => {
		return `/dashboard/patients/${$page.params.patientId}`;
	};
	let open = true;
	let selected = 0;
	let loading = false;
	$: urlSegments = $page.url.pathname.split('/');
	$: patientTree = urlSegments[urlSegments.length - 1];
	console.log(patientTree, urlSegments, $page.url.pathname.split('/'));
</script>

<div
	data-open={open}
	class="group hide-scrollbar relative -ml-4 mb-4 overflow-x-hidden overflow-y-scroll rounded-r-[40px] border-r border-surface-200 p-2 shadow duration-200 data-[open=false]:min-h-[40px] data-[open=true]:min-h-[70%] data-[open=false]:bg-surface-200 data-[open=true]:bg-surface-300 data-[open=false]:dark:bg-surface-800 data-[open=true]:dark:bg-surface-700 md:mb-0 data-[open=false]:md:min-h-[100%] data-[open=true]:md:min-h-[100%] data-[open=false]:md:min-w-[2.5rem] data-[open=true]:md:min-w-[25%] data-[open=true]:xl:min-w-[16.666667%]">
	<button
		class="btn absolute group-data-[open=false]:left-auto group-data-[open=false]:right-0 group-data-[open=false]:top-0 group-data-[open=true]:left-auto group-data-[open=true]:right-0 group-data-[open=false]:md:-left-2 group-data-[open=true]:md:right-0"
		on:click={() => (open = !open)}>
		{#if open}
			<ChevronLeftIcon class="hidden h-6 w-6 min-w-[1.5rem] md:block" />
			<ChevronUpIcon class="block h-6 w-6 min-w-[1.5rem] md:hidden" />
		{:else}
			<ChevronRightIcon class="hidden h-6 w-6 min-w-[1.5rem] md:block" />
			<ChevronDownIcon class="block h-6 w-6 min-w-[1.5rem] md:hidden" />
		{/if}
	</button>
	<h3
		class="ml-2 mt-2 text-surface-500 group-data-[open=false]:mt-0 dark:text-surface-300 group-data-[open=false]:md:hidden">
		Arborescence
	</h3>
	<a
		href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/create`}
		class="variant-outline-secondary btn btn-sm my-2 flex flex-wrap group-data-[open=false]:hidden">
		<PlusIcon class="h-4 w-4 stroke-surface-600 dark:stroke-surface-300" />
		<span class="text-sm text-surface-500 dark:text-surface-400">Situation</span>
		<span class="text-sm text-surface-500 dark:text-surface-400">patho.</span></a>
	<TreeView
		width="w-full group-data-[open=false]:hidden"
		hyphenOpacity="hidden"
		indent="ml-2"
		padding="px-2 py-1"
		caretClosed="-rotate-90"
		caretOpen="rotate-0">
		{#key patient}
			{#each patient.situations_pathologiques ?? [] as sp, idx (sp.sp_id)}
				<TreeViewItem
					spacing="space-x-2 mt-2"
					open={idx === selected}
					on:toggle={async (state) => {
						// EN GROS Là on va juste mettre un if params.sp_id == sp.sp_id fais rien sinon goto(params.sp_id)
						// console.log('In the toggle event', state, $page.params.spId, sp.sp_id);
						if ($page.params.spId !== sp.sp_id && !loading) {
							console.log('what is the page', $page);
							if (sp.upToDate === false) {
								loading = true;
								let db = new DBAdapter();
								let selectStatement =
									'sp_id, created_at, numero_etablissment, service, motif, plan_du_ttt, seances (seance_id,code_id,date,description,has_been_attested,attestation_id,prescription_id,is_paid,gen_id), prescriptions ( prescription_id, date, jointe_a, prescripteur, nombre_seance, seance_par_semaine), attestations (attestation_id, porte_prescr, numero_etablissment, service, has_been_printed, prescription_id, total_recu, valeur_totale, with_indemnity, with_intake, with_rapport, date), generateurs_de_seances (gen_id, created_at, auto, groupe_id, lieu_id, duree, intake, examen_consultatif, rapport_ecrit, rapport_ecrit_custom_date, volet_j, seconde_seance_fa, duree_seconde_seance_fa, nombre_code_courant_fa, volet_h, patho_lourde_type, gmfcs, seconde_seance_e, premiere_seance, jour_seance_semaine_heures, deja_faites, default_seance_description, nombre_seances, seances_range, date_presta_chir_fa, examen_ecrit_date, amb_hos, rapport_ecrit_date), documents (document_id, created_at, form_data)';
								let completedSp = await db.retrieve('situations_pathologiques', selectStatement, [
									'sp_id',
									sp.sp_id
								]);
								completedSp = new SituationPathologique(completedSp.data[0]);
								completedSp.upToDate = true;
								patients.update((p) => {
									let patientIndex = p.findIndex((p) => p.patient_id === patient.patient_id);
									let spIndex = p[patientIndex].situations_pathologiques.findIndex(
										(sp) => sp.sp_id === completedSp.sp_id
									);
									p[patientIndex].situations_pathologiques[spIndex] = completedSp;
									return p;
								});
								loading = false;
								console.log('the completed sp', completedSp);
							}
							goto(`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}`);
							selected = idx;
						} else if (
							$page.params.spId === sp.sp_id &&
							$page.url.pathname !==
								'/dashboard/patients/' + patient.patient_id + '/situation-pathologique/' + sp.sp_id
						) {
							goto(`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}`);
						}
					}}>
					<svelte:fragment slot="lead">
						<FolderIcon
							class={`h-5 w-5 ${
								$page.params.spId !== sp.sp_id
									? 'fill-surface-700 dark:fill-surface-300'
									: 'fill-error-700 dark:fill-error-300'
							}`} />
					</svelte:fragment>
					<h5 class="text-surface-600 dark:text-surface-200">
						{loading
							? 'Chargement...'
							: `Situation du ${new Date(sp.created_at).toLocaleDateString()}`}
					</h5>
					<svelte:fragment slot="children">
						{#if !loading}
							<TreeViewItem>
								<a
									href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/prescriptions`}
									class="text-surface-700 dark:text-surface-100">Prescriptions</a>
								<svelte:fragment slot="lead">
									<PageIcon class="h-5 w-5 fill-surface-700 dark:fill-surface-300" />
								</svelte:fragment>
							</TreeViewItem>
							<TreeViewItem>
								<a
									href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/attestations`}
									class="text-surface-700 dark:text-surface-100">Attestations</a>
								<svelte:fragment slot="lead">
									<PageIcon class="h-5 w-5 fill-surface-700 dark:fill-surface-300" />
								</svelte:fragment>
							</TreeViewItem>
							<TreeViewItem>
								<h5 class="text-surface-700 dark:text-surface-100">Documents</h5>
								<svelte:fragment slot="lead">
									<PageIcon class="h-5 w-5 fill-surface-700 dark:fill-surface-300" />
								</svelte:fragment>
							</TreeViewItem>
							<TreeViewItem>
								<h5 class="text-surface-700 dark:text-surface-100">Séances</h5>
								<svelte:fragment slot="lead">
									<PageIcon class="h-5 w-5 fill-surface-700 dark:fill-surface-300" />
								</svelte:fragment>
							</TreeViewItem>
						{/if}
					</svelte:fragment>
				</TreeViewItem>
			{/each}
		{/key}
	</TreeView>
</div>
