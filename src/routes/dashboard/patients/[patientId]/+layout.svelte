<script>
	import { t } from '../../../../lib/i18n';
	import Breadcrumbs from '../../../../lib/patient-detail/Breadcrumbs.svelte';
	import { reloadPatientSpRetrieval } from '../../../../lib/utils/depenciesRelodingScripts';
	let { data, children } = $props();

	const reload = new Promise(async (resolve) => {
		await reloadPatientSpRetrieval(data);
		resolve();
	});
</script>

{#await reload then _}
	{#if data.patient === 'none'}
		{$t('patients.detail', '404')}
	{:else}
		<div class="flex h-full w-full flex-col items-start justify-start" style="view-transition-name: filariane;">
			<Breadcrumbs currentSp={data.sp} patient={data.patient} />
			{@render children()}
			<!-- <div class="flex h-full w-full flex-col md:flex-row">
					<Arborescence {patient} />
					<div class="w-full overflow-y-scroll"><slot /></div>
				</div> -->
		</div>
	{/if}
{/await}
