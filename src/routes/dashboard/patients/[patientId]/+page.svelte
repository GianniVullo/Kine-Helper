<script>
	import { t } from '../../../../lib/i18n';
	import dayjs from 'dayjs';
	import Title from '$lib/patient-detail/Title.svelte';
	import CardTable from '../../../../lib/components/CardTable.svelte';
	import { goto } from '$app/navigation';
	import { chevronRightIcon } from '../../../../lib/ui/svgs/IconSnippets.svelte';

	let { data } = $props();
	let sps = data.patient?.situations_pathologiques?.length > 0;
</script>

<Title patient={data.patient} />
{#if sps}
	<div
		class="mt-10 w-full border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
		<h3 class="text-base font-semibold text-gray-900 dark:text-white">
			{$t('shared', 'pathologicalSituations', {}, 'Situations pathologiques')}
		</h3>
		<div class="mt-3 sm:mt-0 sm:ml-4">
			<a
				href={`/dashboard/patients/${data.patient.patient_id}/situation-pathologique/create`}
				class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
				>{$t('sp.create', 'title', {}, 'Ajouter une situation pathologique')}</a>
		</div>
	</div>

	<ul role="list" class="w-full divide-y divide-gray-100">
		<CardTable>
			{#snippet header()}
				<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold"
					>{$t('sp.detail', 'reason', {}, 'Motif')}</th>
				<th
					scope="col"
					class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold sm:pl-0">Date</th>
				<th scope="col" class="sr-only px-3 py-3.5 text-left text-sm font-semibold"
					>Consulter</th>
				<!-- TODO Ici j'ai mis action parce que, en fait, il va falloir mettre Modifier, Supprimer, Imprimer, Marquer comme payée par la mutuelle, par le patient, et qui sait quoi d'autres encore -->
			{/snippet}
			{#snippet body()}
				{#each data.patient?.situations_pathologiques as sp}
					<tr
						class="hover:cursor-pointer"
						onclick={() => {
							goto(
								'/dashboard/patients/' +
									data.patient.patient_id +
									'/situation-pathologique/' +
									sp.sp_id
							);
						}}>
						<td class="px-3 py-5 text-sm whitespace-nowrap">
							{sp.motif}
						</td>
						<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
							{dayjs(sp.created_at).format('DD/MM/YYYY')}
						</td>
						<td
							class="relative flex items-center justify-end py-5 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
							<p class="text-indigo-500 group-hover:text-indigo-700">Consulter</p>
							{@render chevronRightIcon('size-5 flex-none text-indigo-400 mr-5')}
						</td>
					</tr>
				{/each}
			{/snippet}
		</CardTable>
	</ul>
{:else}
	<div class="mt-10 w-full text-center">
		<svg
			class="mx-auto size-12 text-gray-400"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-hidden="true">
			<path
				vector-effect="non-scaling-stroke"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
		</svg>
		<h3 class="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
			Vous n'avez pas encore de situation pathologique
		</h3>
		<p class="mt-1 text-sm text-gray-500">{$t('patients.detail', 'start')}</p>
		<div class="mt-6">
			<a
				href={`/dashboard/patients/${data.patient.patient_id}/situation-pathologique/create`}
				type="button"
				class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
				<svg
					class="mr-1.5 -ml-0.5 size-5"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
					data-slot="icon">
					<path
						d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
				</svg>
				{$t('patients.detail', 'startButton')}
			</a>
		</div>
	</div>

	<!-- <div class="ml-2 mt-12 flex flex-col items-start justify-start">
		<h1 class="mb-3 text-lg">{$t('patients.detail', 'start')}</h1>
		<div>
			<a
				href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/create`}
				class="variant-filled-primary btn">
				{$t('patients.detail', 'startButton')}
			</a>
		</div>
	</div> -->
{/if}
