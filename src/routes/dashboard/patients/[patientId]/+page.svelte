<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { patients } from "$lib/stores/PatientStore";
	import { t } from '../../../../lib/i18n';

	let patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	let sps = patient.situations_pathologiques.length > 0;

	console.log('sps equal', sps);
	if (sps) {
		goto(
			'/dashboard/patients/' +
				$page.params.patientId +
				'/situation-pathologique/' +
				patient.situations_pathologiques[0]?.sp_id
		);
	}
</script>

{#if !sps}
	<div class="mt-12 flex flex-col items-start justify-start">
		<h1 class="mb-3 text-lg">{$t('patients.detail', 'start')}</h1>
		<div>
			<a
				href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/create`}
				class="variant-filled-primary btn">
				{$t('patients.detail', 'startButton')}
			</a>
		</div>
	</div>
{/if}
