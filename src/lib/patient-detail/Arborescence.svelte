<script>
	import { page } from '$app/stores';
	import {
		ArrowRightIcon,
		PlusIcon,
		ChevronDownIcon,
		ChevronRightIcon,
		ChevronLeftIcon,
		ChevronUpIcon
	} from '../ui/svgs/index';
	import { t } from '../i18n';

	export let patient;
	let open = true;
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
		{$t('sp.detail', 'treeStructure')}
	</h3>
	<a
		href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/create`}
		class="variant-outline-secondary btn btn-sm my-2 flex flex-wrap group-data-[open=false]:hidden">
		<PlusIcon class="h-4 w-4 stroke-surface-600 dark:stroke-surface-300" />
		<span class="text-sm text-surface-500 dark:text-surface-400"
			>{$t('shared', 'pathologicalSituation')}</span
		></a>

	<div class="mt-8 flex select-none flex-col space-y-4">
		{#each patient.situations_pathologiques as sp, i}
			<div
				class="flex flex-col space-y-2 rounded-lg border border-surface-400 px-4 py-2 shadow duration-200 hover:bg-surface-100/25 group-data-[open=false]:hidden hover:dark:bg-surface-600/25 {sp.sp_id ===
				$page.params.spId
					? '!border-primary-500 dark:bg-surface-800 hover:dark:bg-surface-800'
					: 'opacity-50 hover:opacity-100'}">
				<!--* Header -->
				<!--? Titre et bouton d'accès -->
				<div class="flex cursor-default select-none items-center justify-between">
					<h5 class="text-sm text-surface-700 dark:text-surface-300">
						{sp.motif.substring(0, 20)}{sp.motif.length > 20 ? '...' : ''}
					</h5>
					{#if $page.params.spId !== sp.sp_id || $page.route.id !== '/dashboard/patients/[patientId]/situation-pathologique/[spId]'}
						<a
							href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}`}
							class="btn-icon btn-icon-sm rounded-lg bg-surface-300 dark:bg-surface-600/35"
							><ArrowRightIcon class="stroke-surf h-5 w-5" /></a>
					{/if}
				</div>
				<!--* Navigation -->
				{#if sp.upToDate}
					<div
						class="flex flex-col space-y-1 rounded-2xl border border-surface-600 bg-surface-200/85 py-2 pl-4 text-surface-500 shadow-md duration-200 dark:bg-surface-800 dark:text-surface-300">
						<a
							href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/prescriptions`}
							class="flex cursor-pointer items-center duration-200 hover:translate-x-2 hover:text-surface-800 hover:dark:text-surface-200">
							<ChevronRightIcon class="h-5 w-5" />
							<h5>{$t('sp.detail', 'prescriptions')}</h5>
						</a>
						<a
							href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/attestations`}
							class="flex cursor-pointer items-center duration-200 hover:translate-x-2 hover:text-surface-800 hover:dark:text-surface-200">
							<ChevronRightIcon class="h-5 w-5" />
							<h5>{$t('sp.detail', 'attestations')}</h5>
						</a>
						<a
							href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/documents`}
							class="flex cursor-pointer items-center duration-200 hover:translate-x-2 hover:text-surface-800 hover:dark:text-surface-200">
							<ChevronRightIcon class="h-5 w-5" />
							<h5>{$t('sp.detail', 'documents')}</h5>
						</a>
						<div
							class="flex cursor-pointer items-center duration-200 hover:translate-x-2 hover:text-surface-800 hover:dark:text-surface-200">
							<ChevronRightIcon class="h-5 w-5" />
							<h5>{$t('patients.detail', 'prestations')}</h5>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
