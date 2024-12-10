<script>
	import SpTitle from '../../../../../../lib/patient-detail/SPTitle.svelte';
	import { patients } from '../../../../../../lib/stores/PatientStore';
	import { t } from '../../../../../../lib/i18n';
	import { page } from '$app/stores';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import Tabs from '../../../../../../lib/components/Tabs.svelte';

	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	let { children } = $props();
	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	const currentSp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
	console.log('THE PAGE', $page);

	const tabs = [
		{
			href: `/dashboard/patients/${patient.patient_id}/situation-pathologique/${currentSp.sp_id}`,
			nom: 'Home'
		},
		{
			href: `/dashboard/patients/${patient.patient_id}/situation-pathologique/${currentSp.sp_id}/prescriptions`,
			nom: $t('sp.detail', 'prescriptions')
		},
		{
			href: `/dashboard/patients/${patient.patient_id}/situation-pathologique/${currentSp.sp_id}/attestations`,
			nom: $t('sp.detail', 'attestations')
		},
		{
			href: `/dashboard/patients/${patient.patient_id}/situation-pathologique/${currentSp.sp_id}/documents`,
			nom: $t('sp.detail', 'documents')
		},
		{
			href: `/dashboard/patients/${patient.patient_id}/situation-pathologique/${currentSp.sp_id}/seances`,
			nom: $t('patients.detail', 'prestations')
		}
	];
</script>

<SpTitle {patient} {currentSp} />
<!--* Tabs -->
<Tabs {tabs} />
{@render children()}
