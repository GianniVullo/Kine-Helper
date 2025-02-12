<script>
	import { t } from '../../../../lib/i18n';
	import { page } from '$app/state';
	import Breadcrumbs from '../../../../lib/patient-detail/Breadcrumbs.svelte';
	import { patientState } from '../../../../lib/managers/PatientCache.svelte';

	let { data, children } = $props();
</script>

{#if data.patient}
	<div class="flex h-full w-full flex-col items-start justify-start">
		<Breadcrumbs currentSp={data.sp} patient={data.patient} />
		{@render children()}
		<!-- <div class="flex h-full w-full flex-col md:flex-row">
					<Arborescence {patient} />
					<div class="w-full overflow-y-scroll"><slot /></div>
				</div> -->
	</div>
{:else}
	{$t('patients.detail', '404')}
{/if}
