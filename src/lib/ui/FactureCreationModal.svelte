<script>
	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { FormWrapper, SelectFieldV2, SubmitButton, RadioFieldV2 } from '../forms/index';
	import dayjs from 'dayjs';
	import { fetchCodeDesSeances } from '../utils/nomenclatureManager';
	import { FacturePatient } from '../pdfs/facturePatient';
	import { FactureMutuelle } from '../pdfs/factureMutuelle';
	import { patients } from '../stores/PatientStore';
	import DateField from '../forms/abstract-fields/DateField.svelte';
	import { t } from '../i18n';
	import { get } from 'svelte/store';

	export let parent;

	const modalStore = getModalStore();
	let formSchema = {
		isValid,
		validators: {}
	};
	const sp = $modalStore[0].meta?.sp;
	const patient = $patients.find((p) => p.patient_id === sp.patient_id);

	const options = [
		{
			value: 0,
			label: `${get(t)('otherModal', 'facture')} ${get(t)('otherModal', 'facture.patient')}`
		},
		{
			value: 1,
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
		console.log(attestationsIds);
		let valeurTotale = 0.0;
		let totalValeurRecue = 0.0;
		let totalRemboursement = 0.0;
		attestations.forEach((attestation) => {
			if (attestationsIds.includes(attestation.attestation_id)) {
				valeurTotale += attestation.valeur_totale;
				totalValeurRecue += attestation.total_recu;
				totalRemboursement += attestation.valeur_totale - attestation.total_recu;
			}
		});
		let codes = await fetchCodeDesSeances(
			null,
			$modalStore[0].meta?.sp.seances,
			$modalStore[0].meta?.sp
		);
		if (factureType === 1) {
			// imprimer une facture mutuelle
			let codeNumber = sp.seances.filter((seance) =>
				attestationsIds.includes(seance.attestation_id)
			).length;
			let form_data = {
				attestationsIds,
				tableRows: [
					{
						Nom: `${patient.nom}\n${patient.prenom}`,
						NISS: patient.niss,
						Codes: codeRefChain(codes),
						'Nbr. de prestations effectuées': `${codeNumber}`,
						total: sp.attestations
							.reduce((acc, a) => {
								if (attestationsIds.includes(a.attestation_id)) {
									acc += a.valeur_totale - a.total_recu;
								}
								return acc;
							}, 0.0)
							.toFixed(2)
					}
				]
			};
			if (dateFactu) {
				form_data.date = dateFactu;
			}
			console.log('form_data', form_data);
			let fMut = new FactureMutuelle(form_data, patient, sp);
			await fMut.save();
		}
		if (factureType === 0) {
			let form_data = {
				total: $modalStore[0].meta?.sp.attestations
					.filter((att) => attestationsIds.includes(att.attestation_id))
					.reduce((acc, att) => acc + att.total_recu, 0.0)
					.toFixed(2),
				codes,
				attestationsIds,
				with_details: true
			};
			if (dateFactu) {
				form_data.date = dateFactu;
			}
			console.log(form_data);
			let fPat = new FacturePatient(form_data, patient, sp);
			await fPat.save();
			// imprimer une facture patient
		}
		modalStore.close();
	}
	function codeRefChain(codes) {
		let ref = '';
		let { withRapport, withIndemnity, withIntake } = codesCollector(
			$modalStore[0].meta?.sp.attestations.filter((att) =>
				attestationsIds.includes(att.attestation_id)
			)
		);
		for (const [key, value] of codes.entries()) {
			switch (key) {
				case 'rapports':
					if (withRapport) {
						ref += value[0].code_reference + ' - ' + value[0].honoraire.toFixed(2) + '€ \n';
					}
					break;
				case 'indemnites':
					if (withIndemnity) {
						console.log('iindeminty', value[0]);
						ref += value[0].code_reference + ' - ' + value[0].honoraire.toFixed(2) + '€ \n';
					}
					break;
				case 'intake':
					if (withIntake) {
						ref += value[0].code_reference + ' - ' + value[0].honoraire.toFixed(2) + '€ \n';
					}
					break;
				default:
					ref += value.code_reference + ' - ' + value.honoraire.toFixed(2) + '€\n';
					break;
			}
		}
		console.log('ref', ref);
		return ref;
	}
	function codesCollector(attestations) {
		let withRapport = false;
		let withIndemnity = false;
		let withIntake = false;
		for (const attestation of attestations) {
			if (attestation.with_rapport) {
				withRapport = true;
			}
			if (attestation.with_intake) {
				withIntake = true;
			}
			if (attestation.with_indemnity) {
				withIndemnity = true;
			}
		}
		return { withRapport, withIndemnity, withIntake };
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
