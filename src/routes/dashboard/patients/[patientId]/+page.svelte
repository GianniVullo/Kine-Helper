<script>
	import { t } from '../../../../lib/i18n';
	import dayjs from 'dayjs';
	import Title from '$lib/patient-detail/Title.svelte';

	let { data } = $props();
	let sps = data.patient?.situations_pathologiques?.length > 0;
</script>

<Title patient={data.patient} />
{#if sps}
	<div
		class="mt-10 w-full border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
		<h3 class="text-base font-semibold text-gray-900">Situations pathologiques</h3>
		<div class="mt-3 sm:mt-0 sm:ml-4">
			<a
				href={`/dashboard/patients/${data.patient.patient_id}/situation-pathologique/create`}
				class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
				>Ajouter une situation pathologique</a>
		</div>
	</div>

	<ul role="list" class="w-full divide-y divide-gray-100">
		{#each data.patient?.situations_pathologiques as sp}
			<li class="relative flex justify-between gap-x-6 py-5">
				<div class="flex min-w-0 gap-x-4">
					<!-- <img
						class="size-12 flex-none rounded-full bg-gray-50"
						src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
						alt="" /> -->
					<div class="min-w-0 flex-auto">
						<p class="text-sm/6 font-semibold text-gray-900">
							<a href={`/dashboard/patients/${sp.patient_id}/situation-pathologique/${sp.sp_id}`}>
								<span class="absolute inset-x-0 -top-px bottom-0"></span>
								{sp.motif}
							</a>
						</p>
						<p class="mt-1 flex truncate text-xs/5 text-gray-500">
							{sp.plan_du_ttt}
						</p>
					</div>
				</div>
				<div class="flex shrink-0 items-center gap-x-4">
					<div class="hidden sm:flex sm:flex-col sm:items-end">
						<span
							class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset"
							>10 séances non tarifiées</span>
						<p class="mt-1 text-xs/5 text-gray-500">
							Créée le <time datetime="2023-01-23T13:23Z"
								>{dayjs(sp.created_at).format('DD/MM/YYYY')}</time>
						</p>
					</div>
					<svg
						class="size-5 flex-none text-gray-400"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
						data-slot="icon">
						<path
							fill-rule="evenodd"
							d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
							clip-rule="evenodd" />
					</svg>
				</div>
			</li>
		{/each}
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
		<h3 class="mt-2 text-sm font-semibold text-gray-900">
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
