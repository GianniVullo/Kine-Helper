<script>
	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { FormWrapper, SelectFieldV2, SubmitButton, RadioFieldV2 } from '../forms/index';
	import dayjs from 'dayjs';
	import { fetchCodeDesSeances } from '../utils/nomenclatureManager';
	import { createFacture, getFacturePDF } from '../user-ops-handlers/documents';
	import { patients } from '../stores/PatientStore';
	import DateField from '../forms/abstract-fields/DateField.svelte';
	import { t } from '../i18n';
	import { get } from 'svelte/store';
	import { user } from './svgs/IconSnippets.svelte';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import { invalidate } from '$app/navigation';

	export let parent;

	const modalStore = getModalStore();
	let formSchema = {
		isValid,
		validators: {}
	};
	const { sp, patient, factures } = $modalStore[0].meta;

	// let factures = getContext('factures');
	console.log('factures in factureCreationModal', factures);
	const options = [
		{
			value: 'patient',
			label: `${get(t)('otherModal', 'facture')} ${get(t)('otherModal', 'facture.patient')}`
		},
		{
			value: 'mutuelle',
			label: `${get(t)('otherModal', 'facture')} ${get(t)('otherModal', 'facture.mutuelle')}`
		}
	];

	let factureType;
	let dateFactu;
	// We've created a custom submit function to pass the response and close the modal.
	let attestationsIds = [];
	let attestations = sp.attestations.map((att) => {
		return {
			value: att.attestation_id,
			label: get(t)('attestation.detail', 'title', { date: dayjs(att.date).format('DD/MM/YYYY') })
		};
	});

	async function isValid({ formData, submitter }) {
		let valeurTotale = 0.0;
		let totalValeurRecue = 0.0;
		let totalRemboursement = 0.0;
		for (const attestation of sp.attestations) {
			if (attestationsIds.includes(attestation.attestation_id)) {
				console.log('attestation', attestation);
				const v_t = parseFloat(attestation.valeur_totale.replace(',', '.'));
				const t_r = parseFloat(attestation.total_recu.replace(',', '.'));
				valeurTotale += v_t;
				totalValeurRecue += t_r;
				totalRemboursement += v_t - t_r;
				console.log('valeurTotale', valeurTotale);
				console.log('totalValeurRecue', totalValeurRecue);
				console.log('totalRemboursement', totalRemboursement);
			}
		}
		let facture = {
			id: crypto.randomUUID(),
			user_id: sp.user_id,
			patient_id: patient.patient_id,
			sp_id: sp.sp_id,
			date: dateFactu,
			type: factureType,
			total:
				factureType === 'patient'
					? totalValeurRecue.toFixed(2).replace('.', ',')
					: totalRemboursement.toFixed(2).replace('.', ',')
		};
		console.log('Sending facture and AttestationIds to createFacture', facture, attestationsIds);
		await createFacture(facture, attestationsIds);
		factures.push(facture);
		invalidate('patient:layout');
		modalStore.close();
	}
	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$t('otherModal', 'fcreate.title')}</header>
		<FormWrapper {formSchema}>
			<RadioFieldV2
				bind:value={factureType}
				label={$t('otherModal', 'doc.type')}
				name="docType"
				required
				{options} />
			{#if attestations}
				<SelectFieldV2
					label={$t('otherModal', 'fcreate.label')}
					multiple
					bind:value={attestationsIds}
					name="attestationIds"
					required
					options={attestations} />
			{/if}
			<DateField label={$t('otherModal', 'fcreate.date')} name="date" bind:value={dateFactu} />
			<SubmitButton>{$t('shared', 'confirm')}</SubmitButton>
		</FormWrapper>
	</div>
{/if}
