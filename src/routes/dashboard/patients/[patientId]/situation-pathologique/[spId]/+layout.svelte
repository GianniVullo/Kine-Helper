<script>
	import SpTitle from '../../../../../../lib/patient-detail/SPTitle.svelte';
	import { patients } from '../../../../../../lib/stores/PatientStore';
	import { t } from '../../../../../../lib/i18n';
	import { page } from '$app/stores';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import Tabs from '../../../../../../lib/components/Tabs.svelte';
	import { get } from 'svelte/store';
	import dayjs from 'dayjs';
	import SoftButton from '../../../../../../lib/components/SoftButton.svelte';
	import PlusIcon from '../../../../../../lib/ui/svgs/PlusIcon.svelte';

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
	let items = [
		{
			name: get(t)('patients.detail', 'attestation'),
			href:
				`/dashboard/patients/${patient.patient_id}/situation-pathologique/${currentSp.sp_id}/attestations` +
				'/create',
			condition:
				currentSp?.seances.filter((seance) => {
					return (
						dayjs(dayjs(seance.date).format('YYYY-MM-DD')).isBefore(dayjs()) &&
						!seance.attestation_id
					);
				}).length > 0
		},
		{
			name: get(t)('patients.detail', 'prescription'),
			href:
				`/dashboard/patients/${patient.patient_id}/situation-pathologique/${currentSp.sp_id}` +
				'/prescriptions/create',
			condition: true
		},
		{
			name: get(t)('patients.detail', 'prestations'),
			href:
				`/dashboard/patients/${patient.patient_id}/situation-pathologique/${currentSp.sp_id}` +
				'/generateurs/create',
			condition: true
		}
	];
</script>

<SpTitle {patient} {currentSp} />
<div class="-mt-5 mb-5 flex w-full items-center justify-start  px-4 py-1 sm:py-1">
	<div class="flex items-center space-x-5">
		<h5 class="text-sm text-gray-500">Actions rapides</h5>
		<div class="flex flex-wrap space-x-2">
			{#each items as { href, name, condition }}
				{#if condition}
					<div class="flex items-center justify-center">
						<SoftButton {href} {name}>
							{#snippet icon()}
								<PlusIcon class="size-3 stroke-indigo-600" />
							{/snippet}
						</SoftButton>
					</div>
				{/if}
			{/each}
			<div class="flex items-center justify-center">
				<SoftButton
					onclick={() => modalStore.trigger(documentSelectionModal)}
					name={$t('patients.detail', 'document')}>
					{#snippet icon()}
						<PlusIcon class="size-3 stroke-indigo-600" />
					{/snippet}
				</SoftButton>
			</div>
		</div>
	</div>
</div>

<!--* Tabs -->
<Tabs className="w-full text-center flex justify-center sm:block" {tabs} />
{@render children()}
