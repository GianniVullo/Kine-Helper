<script>
	import { FormWrapper, SubmitButton, NumberField } from '../index';
	import { createCodeMap } from '../../utils/nomenclatureManager';
	import { page } from '$app/stores';
	import CheckboxFieldV2 from '../abstract-fields/CheckboxFieldV2.svelte';
	import { patients } from '$lib/stores/PatientStore';
	import { t } from '../../i18n';
	import DBAdapter from '$lib/user-ops-handlers/dbAdapter';
	import { goto } from '$app/navigation';

	export let attestation;
	export let codes;

	let mutuelle_paid = attestation.mutuelle_paid;
	let patient_paid = attestation.patient_paid;
	let total_recu = attestation.total_recu;
	let valeur_totale = attestation.valeur_totale;

	const codeMap = createCodeMap();
	codeMap.set(codes);
	let patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	let sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);

	let formSchema = {
		isValid: isValid,
		validators: {}
	};

	async function isValid({ formData, submitter }) {
		console.log('in IsValid with', formData);
		const db = new DBAdapter();

		await db.update('attestations', [['attestation_id', attestation.attestation_id]], {
			mutuelle_paid,
			patient_paid,
			total_recu,
			valeur_totale
		});
		patients.update((p) => {
			const rpatient = p.find((p) => p.patient_id === patient.patient_id);
			const rsp = rpatient.situations_pathologiques.find((lsp) => lsp.sp_id === sp.sp_id);
			let attest = rsp.attestations.find((a) => a.attestation_id === attestation.attestation_id);
			attest.mutuelle_paid = mutuelle_paid;
			attest.patient_paid = patient_paid;
			attest.total_recu = total_recu;
			attest.valeur_totale = valeur_totale;
			return p;
		});
		submitter.disabled = false;
		goto(
			'/dashboard/patients/' +
				patient.patient_id +
				'/situation-pathologique/' +
				sp.sp_id +
				'/attestations'
		);
	}
</script>

<FormWrapper {formSchema}>
	<!--* Fields here -->
	<div class="flex min-w-[30vw] flex-col">
		<div class="max-w-md space-y-4">
			<CheckboxFieldV2
				bind:value={mutuelle_paid}
				name={'mutuelle_paid'}
				label={$t('attestation.detail', 'mutuelle_paid')} />
			<CheckboxFieldV2
				bind:value={patient_paid}
				name={'patient_paid'}
				label={$t('attestation.detail', 'patient_paid')} />
			<NumberField
				bind:value={total_recu}
				name={'total_recu'}
				label={$t('attestation.detail', 'total_recu')} />
			<NumberField
				bind:value={valeur_totale}
				name={'valeur_totale'}
				label={$t('attestation.detail', 'valeur_totale')} />
		</div>
	</div>
	<SubmitButton />
</FormWrapper>
