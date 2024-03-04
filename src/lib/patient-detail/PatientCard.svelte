<script>
	// import HomeIcon from '../ui/svgs/HomeIcon.svelte'
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import ConsultIcon from '../ui/svgs/ConsultIcon.svelte';
	import { t } from '../i18n';

	export let patient; // Patient object passed as a prop
	export let loading = false;
</script>

<div
	class="group/consultation group card-hover flex cursor-pointer flex-col items-start justify-between rounded-lg bg-white/90 p-6">
	<div class="mb-4 h-1 bg-gradient-to-r from-primary-400 to-secondary-500 opacity-50"></div>
	<h2 class="text-xl font-medium text-surface-900">{patient.nom} {patient.prenom}</h2>
	{#if loading}
		<div class="mt-4 flex flex-col space-y-2">
			<p class="text-surface-900">{$t('shared', 'loading')}</p>
			<ProgressRadial width="w-12" />
		</div>
	{:else}
		<div class="mt-1 flex items-start">
			<!-- <HomeIcon class="h-4 w-4 mr-2" /> -->
			<div class="flex flex-col border-l border-surface-400 pl-1">
				<p class="text-base text-surface-400">{patient.adresse}</p>
				<p class="text-base text-surface-400">{patient.cp} {patient.localite}</p>
			</div>
		</div>
		<div class="mt-3 flex items-end">
			<ConsultIcon
				class="h-6 w-6 stroke-surface-600 duration-200 group-hover/consultation:text-surface-700" />
			<p class="text-sm text-surface-600 duration-200 group-hover/consultation:text-surface-700">
				{$t('patients.detail', 'consult')}
			</p>
		</div>
	{/if}
</div>
