<script>
	import dayjs from 'dayjs';
	import { goto } from '$app/navigation';
	import {
		FormWrapper,
		SubmitButton,
		DefaultFieldWrapper,
		TextFieldV2,
	} from '../index';
	import DBAdapter from '../actions/dbAdapter';
	import { SituationPathologique } from '../../stores/PatientStore';
	import { patients } from '../../stores/PatientStore';
	import { t } from '../../i18n';

	export let patient;
	export let situation_pathologique = null;

	let patient_id = situation_pathologique?.patient_id ?? patient.patient_id;
	let sp_id = situation_pathologique?.sp_id ?? crypto.randomUUID();
	let created_at = situation_pathologique?.created_at ?? dayjs().format('YYYY-MM-DD');
	let numero_etablissement = situation_pathologique?.numero_etablissment;
	let service = situation_pathologique?.service;
	let motif = situation_pathologique?.motif;
	let plan_du_ttt = situation_pathologique?.plan_du_ttt;
	let intake = situation_pathologique?.intake;
	let with_indemnity = situation_pathologique?.with_indemnity;
	let rapport_ecrit = situation_pathologique?.rapport_ecrit;
	let rapport_ecrit_custom_date = situation_pathologique?.rapport_ecrit_custom_date;
	let rapport_ecrit_date = situation_pathologique?.rapport_ecrit_date;

	let formSchema = {
		isValid: isValid,
		validators: {}
	};

	async function isValid({ formData, submitter }) {
		let db = new DBAdapter();
		let situation_pathologique = new SituationPathologique({
			sp_id,
			created_at,
			patient_id,
			motif,
			plan_du_ttt,
			intake: intake ?? null,
			rapport_ecrit: rapport_ecrit ?? null,
			rapport_ecrit_date,
			rapport_ecrit_custom_date,
			with_indemnity: with_indemnity ?? null,
			service,
			numero_etablissement
		});
		let dbStatus = await db.save('situations_pathologiques', situation_pathologique.toDB);
		patients.update((patients) => {
			let rpatient = patients.find((p) => p.patient_id == patient.patient_id);
			rpatient.situations_pathologiques.push(situation_pathologique);
			return patients;
		});
		goto(
			`/dashboard/patients/${patient.patient_id}/situation-pathologique/${situation_pathologique.sp_id}`
		);

		submitter.disabled = false;
	}
</script>

<FormWrapper {formSchema}>
	<DefaultFieldWrapper>
		<label class="select-none text-surface-500 dark:text-surface-300" for="motif"
			>{$t('sp.detail', 'reason')}
			<textarea
				id="motif"
				bind:value={motif}
				required
				name={$t('sp.detail', 'reason')}
				class="textarea mt-2 rounded-lg"
				placeholder={$t('sp.detail', 'reason.label')}
				rows="4"></textarea>
		</label>
	</DefaultFieldWrapper>
	<DefaultFieldWrapper>
		<label class="select-none text-surface-500 dark:text-surface-300" for="plan_du_ttt"
			>{$t('sp.detail', 'plan')}
			<textarea
				id="plan_du_ttt"
				bind:value={plan_du_ttt}
				name="plan_du_ttt"
				required
				class="textarea mt-2 rounded-lg"
				placeholder={$t('sp.detail', 'plan.label')}
				rows="4"></textarea>
		</label>
	</DefaultFieldWrapper>
	<h2 class="font-bold text-surface-600 dark:text-surface-400">{$t('sp.detail', 'nonRequired')}</h2>
	<h4 class="text-surface-800 dark:text-surface-300">
		{$t('sp.detail', 'nonRequired.help')}
	</h4>
	<TextFieldV2 name="service" bind:value={service} placeholder={$t('sp.update', 'label.service')} label={$t('sp.update', 'label.service')} />
	<TextFieldV2
		name="numero_etablissement"
		bind:value={numero_etablissement}
		placeholder={$t('sp.update', 'label.numero_etablissement')}
		label={$t('sp.update', 'label.numero_etablissement')} />
	<SubmitButton />
</FormWrapper>
