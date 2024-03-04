<script>
	import {
		TextFieldV2,
		CheckboxFieldV2,
		FormWrapper,
		DateField,
		SubmitButton
	} from '../../../../../../../lib/forms/index';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import DBAdapter from '../../../../../../../lib/forms/actions/dbAdapter';
	import dayjs from 'dayjs';
	import { patients } from '../../../../../../../lib/stores/PatientStore';
	import { tick } from 'svelte';
	import { t } from '../../../../../../../lib/i18n';

	let formSchema = {
		isValid
	};
	let sp = $patients
		.find((p) => p.patient_id === $page.params.patientId)
		.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
	let motif = sp.motif;
	let plan_du_ttt = sp.plan_du_ttt;
	let service = sp.service;
	let numero_etablissement = sp.numero_etablissement;
	let intake = sp.intake;
	let with_indemnity = sp.with_indemnity;
	let rapport_ecrit = sp.rapport_ecrit;
	let rapport_ecrit_custom_date = sp.rapport_ecrit_custom_date;

	async function isValid() {
		console.log('isValid updating sp');
		let db = new DBAdapter();
		await db.update('situations_pathologiques', [['sp_id', sp.sp_id]], {
			motif,
			plan_du_ttt,
			service,
			numero_etablissement,
			intake,
			with_indemnity,
			rapport_ecrit,
			rapport_ecrit_custom_date
		});
		patients.update((ps) => {
			let patient = ps.find((p) => p.patient_id === $page.params.patientId);
			let spIndex = patient.situations_pathologiques.findIndex(
				(sp) => sp.sp_id === $page.params.spId
			);
			patient.situations_pathologiques[spIndex] = {
				...patient.situations_pathologiques[spIndex],
				motif,
				plan_du_ttt,
				service,
				numero_etablissement,
				intake,
				with_indemnity,
				rapport_ecrit,
				rapport_ecrit_custom_date
			};
			return ps;
		});
		await tick();
		goto(`/dashboard/patients/${$page.params.patientId}/situation-pathologique/${sp.sp_id}`);
	}
	console.log('sp', sp);
</script>

<div class="flex flex-col">
	<h5 class="text-lg text-surface-500 dark:text-surface-400">
		{$t('sp.update', 'title', { date: dayjs(sp.created_at).format('DD/MM/YYYY') })}
	</h5>
	<FormWrapper {formSchema}>
		<TextFieldV2 name="motif" bind:value={motif} label={$t('sp.detail', 'reason')} />
		<TextFieldV2 name="plan_du_ttt" bind:value={plan_du_ttt} label={$t('sp.detail', 'plan')} />
		<TextFieldV2 name="service" bind:value={service} label={$t('sp.update', 'label.service')} />
		<TextFieldV2
			name="numero_etablissement"
			bind:value={numero_etablissement}
			label={$t('sp.update', 'label.numero_etablissement')} />
		<CheckboxFieldV2 name="intake" bind:value={intake} label="Intake" />
		<CheckboxFieldV2
			name="with_indemnity"
			bind:value={with_indemnity}
			label={$t('sp.update', 'label.with_indemnity')} />
		<CheckboxFieldV2
			name="rapport_ecrit"
			bind:value={rapport_ecrit}
			label={$t('sp.update', 'label.rapport_ecrit')} />
		{#if rapport_ecrit}
			<DateField
				name="rapport_ecrit_custom_date"
				bind:value={rapport_ecrit_custom_date}
				label={$t('sp.update', 'label.rapport_ecrit_custom_date')} />
		{/if}
		<SubmitButton />
	</FormWrapper>
</div>
