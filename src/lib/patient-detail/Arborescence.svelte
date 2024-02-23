<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import dayjs from 'dayjs';
	import {
		ArrowRightIcon,
		FolderIcon,
		PageIcon,
		PlusIcon,
		ChevronDownIcon,
		ChevronRightIcon,
		ChevronLeftIcon,
		ChevronUpIcon
	} from '../ui/svgs/index';
	import { TreeView, TreeViewItem } from '@skeletonlabs/skeleton';
	import DBAdapter from '../forms/actions/dbAdapter';
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
				<div class="flex">
					<TreeViewItem spacing="space-x-2 mt-2" open={idx === selected}>
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
								: `Situation du ${dayjs(sp.created_at).format('DD/MM/YYYY')}`}
						</h5>
						<svelte:fragment slot="children">
							{#if !loading}
								{#if sp.prescriptions.length > 0}
									<TreeViewItem>
										<a
											href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/prescriptions`}
											class="text-surface-700 dark:text-surface-100">Prescriptions</a>
										<svelte:fragment slot="lead">
											<PageIcon class="h-5 w-5 fill-surface-700 dark:fill-surface-300" />
										</svelte:fragment>
									</TreeViewItem>
								{/if}
								{#if sp.attestations.length > 0}
									<TreeViewItem>
										<a
											href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/attestations`}
											class="text-surface-700 dark:text-surface-100">Attestations</a>
										<svelte:fragment slot="lead">
											<PageIcon class="h-5 w-5 fill-surface-700 dark:fill-surface-300" />
										</svelte:fragment>
									</TreeViewItem>
								{/if}
								{#if sp.documents.length > 0}
									<TreeViewItem>
										<a
											href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/documents`}
											class="text-surface-700 dark:text-surface-100">Documents</a>
										<svelte:fragment slot="lead">
											<PageIcon class="h-5 w-5 fill-surface-700 dark:fill-surface-300" />
										</svelte:fragment>
									</TreeViewItem>
								{/if}
								<!-- <TreeViewItem>
									<h5 class="text-surface-700 dark:text-surface-100">Séances</h5>
									<svelte:fragment slot="lead">
										<PageIcon class="h-5 w-5 fill-surface-700 dark:fill-surface-300" />
									</svelte:fragment>
								</TreeViewItem> -->
							{/if}
						</svelte:fragment>
					</TreeViewItem>
					{#if $page.route.id !== '/dashboard/patients/[patientId]/situation-pathologique/[spId]' || $page.params.spId !== sp.sp_id}
						<div class="flex items-center justify-center">
							<button
								class="variant-filled btn-icon btn-icon-sm flex items-center justify-center"
								on:click={async (state) => {
									console.log('going to the sp', sp.sp_id);

									// EN GROS Là on va juste mettre un if params.sp_id == sp.sp_id fais rien sinon goto(params.sp_id)
									// console.log('In the toggle event', state, $page.params.spId, sp.sp_id);
									if ($page.params.spId !== sp.sp_id && !loading) {
										console.log('what is the page', $page);
										if (sp.upToDate === false) {
											loading = true;
											let db = new DBAdapter();
											let completedSp = await db.retrieve_sp(sp.sp_id);
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
										goto(
											`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}`
										);
										selected = idx;
									} else if (
										$page.params.spId === sp.sp_id &&
										$page.url.pathname !==
											'/dashboard/patients/' +
												patient.patient_id +
												'/situation-pathologique/' +
												sp.sp_id
									) {
										goto(
											`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}`
										);
									}
								}}>
								<ArrowRightIcon class="h-5 w-5 fill-surface-700 dark:fill-surface-300" />
							</button>
						</div>
					{/if}
				</div>
			{/each}
		{/key}
	</TreeView>
</div>
