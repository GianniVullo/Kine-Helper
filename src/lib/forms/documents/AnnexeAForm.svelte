<script>
	import { FormWrapper, SubmitButton, DateField } from '../index';
	import SituationPathologiqueSelector from './SituationPathologiqueSelector.svelte';
	import { goto } from '$app/navigation';
	import { t } from '../../i18n';
	import { get } from 'svelte/store';
	import { appState } from '../../managers/AppState.svelte';
	import { metadata } from 'valibot';
	import { createAnnexe } from '../../user-ops-handlers/documents';

	let message = '';

	let { patient, sp, doc, accords = $bindable() } = $props();

	let situationPathologique = doc ? doc.situation_pathologique : [];
	let date = doc?.date;
	console.log('accords In AnnexeAForm', accords);
	let formSchema = {
		isValid: isValid,
		validators: {}
	};

	async function isValid({ formData, submitter }) {
		if (
			![0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].includes(
				parseInt(situationPathologique)
			)
		) {
			message = get(t)('form.annexeA', 'validation.sp');
			submitter.disabled = false;
			return;
		}
		if (doc) {
		} else {
			let accord = {
				id: crypto.randomUUID(),
				user_id: appState.user.id,
				patient_id: patient.patient_id,
				sp_id: sp.sp_id,
				situationPathologique,
				date,
				buildable: true,
				metadata: {
					doc: 'A'
				}
			};
			let { data, error } = await createAnnexe(accord);
			if (error) {
				message = error;
				submitter.disabled = false;
				return;
			}
		}
		goto(
			'/dashboard/patients/' +
				patient.patient_id +
				'/situation-pathologique/' +
				sp.sp_id +
				'/documents'
		);
		submitter.disabled = false;
	}
</script>

<FormWrapper {formSchema}>
	<DateField bind:value={date} label={$t('form.annexeA', 'label.date')} name="date" required />
	<SituationPathologiqueSelector aOrB="A" bind:value={situationPathologique} />
	<div class="font-semibold">{message}</div>
	<SubmitButton />
</FormWrapper>
