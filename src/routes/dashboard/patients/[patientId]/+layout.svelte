<script>
	import { t } from '../../../../lib/i18n';
	import Breadcrumbs from '../../../../lib/patient-detail/Breadcrumbs.svelte';

	let { data, children } = $props();
</script>

{#if data.patient === 'none'}
	{$t('patients.detail', '404')}
{:else}
	<div
		class="flex h-full w-full flex-col items-start justify-start"
		style="view-transition-name: filariane;">
		<Breadcrumbs currentSp={data.sp} patient={data.patient} />
		{@render children()}
		<!-- <div class="flex h-full w-full flex-col md:flex-row">
					<Arborescence {patient} />
					<div class="w-full overflow-y-scroll"><slot /></div>
				</div> -->
	</div>
{/if}
