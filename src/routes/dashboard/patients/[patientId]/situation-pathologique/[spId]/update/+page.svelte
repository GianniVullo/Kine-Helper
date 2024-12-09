<script>
	import {
		TextFieldV2,
		CheckboxFieldV2,
		FormWrapper,
		// RadioFieldV2,
		// SelectFieldV2,
		DateField,
		SubmitButton
	} from '../../../../../../../lib/forms/index';
	// import PathologieLourdeFields from '../../../../../../../lib/forms/situation-pathologique/fields/PathologieLourdeFields.svelte';
	// import { groupes, lieux, lieuxParGroupe } from '../../../../../../../lib/stores/codeDetails';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import dayjs from 'dayjs';
	import { patients } from '../../../../../../../lib/stores/PatientStore';
	import { tick } from 'svelte';
	import { t } from '../../../../../../../lib/i18n';
	import { editSituationPathologique } from '../../../../../../../lib/user-ops-handlers/situations_pathologiques';

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
	let groupe_id = sp.groupe_id;
	// let patho_lourde_type = sp.patho_lourde_type;
	let lieu_id = sp.lieu_id;
	// let duree = sp.duree;
	// let volet_j = sp.volet_j;
	// let volet_h = sp.volet_h;
	// let gmfcs = sp.gmfcs;
	// let seconde_seance_fa = sp.seconde_seance_fa;
	// let seconde_seance_e = sp.seconde_seance_e;
	// let duree_seconde_seance_fa = sp.duree_seconde_seance_fa;
	// let deja_faites = sp.deja_faites;
	// let date_presta_chir_fa = sp.date_presta_chir_fa;

	// let groupOptions = groupes()
	// 	.map((value, index) => {
	// 		if ([0, 1, 3, 4, 5, 6, 7].includes(index)) {
	// 			return { label: value, value: index, id: `group${index}` };
	// 		}
	// 	})
	// 	.filter((value) => {
	// 		console.log('here we are with', value, 'and', groupe_id);
	// 		if (!value) {
	// 			return false;
	// 		}
	// 		return parseInt(value.value) === groupe_id;
	// 	});

	// let lieuOptions = lieux()
	// 	.map((val, index) => {
	// 		if (groupe_id === 'undefined' || groupe_id == undefined) {
	// 			return undefined;
	// 		}
	// 		let groupSchema = lieuxParGroupe[parseInt(groupe_id)];
	// 		if (groupSchema[0] === '*' || groupSchema.includes(index)) {
	// 			return { label: val, value: index, id: `lieu${index}` };
	// 		}
	// 	})
	// 	.filter((val) => {
	// 		console.log('here we are with', val, 'and', lieu_id);
	// 		if (!val) {
	// 			return false;
	// 		}
	// 		return val.value === sp.lieu_id});

	async function isValid() {
		console.log('isValid updating sp');
		let data = {
			...sp,
			motif,
			plan_du_ttt,
			service,
			numero_etablissement,
			intake,
			with_indemnity,
			rapport_ecrit,
			rapport_ecrit_custom_date
		};
		await editSituationPathologique(data);
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
		<!-- <SelectFieldV2
			name="groupe"
			bind:value={groupe_id}
			options={groupOptions}
			placeholder={$t('form.generateur', 'group.placeholder')}
			label={$t('form.generateur', 'group.label')}
			required />

		<SelectFieldV2
			name="lieu"
			bind:value={lieu_id}
			options={lieuOptions}
			placeholder={$t('form.generateur', 'lieu.placeholder')}
			label={$t('form.generateur', 'lieu.label')} />
		<RadioFieldV2
			name="duree"
			readOnly
			bind:value={duree}
			options={[
				{ value: 0, label: '15min' },
				{ value: 2, label: '30min' }
			]}
			inline
			label={$t('form.generateur', 'duree.label')}
			required />
		<PathologieLourdeFields
			readOnly
			bind:pathologieLourde={patho_lourde_type}
			bind:GMFCSScore={gmfcs}
			bind:secondeSeance={seconde_seance_e} />
		<CheckboxFieldV2
			readOnly
			name="volet_j"
			label={$t('form.generateur', 'j.label')}
			bind:value={volet_j} />
		<CheckboxFieldV2
			readOnly
			name="seconde_seance_fa"
			label={$t('form.generateur', 'second.label')}
			bind:value={seconde_seance_fa} />
		<RadioFieldV2
			readOnly
			name="duree_seconde_seance_fa"
			bind:value={duree_seconde_seance_fa}
			options={[
				{ value: 0, label: '15min' },
				{ value: 2, label: '30min' }
			]}
			inline
			label={$t('form.generateur', 'duree.label')}
			required />
		<DateField
			readOnly
			label={$t('form.generateur', 'second_fa.label')}
			required
			parentClass="flex-row flex"
			name="date_presta_chir_fa"
			bind:value={date_presta_chir_fa} />
		<CheckboxFieldV2
			readOnly
			name="volet_h"
			label={$t('form.generateur', 'h.label')}
			bind:value={volet_h} />
		<label class="flex flex-col items-start justify-start">
			<p class="select-none text-surface-500 dark:text-surface-300">
				{$t('form.generateur', 'alredaydone.title')}
			</p>
			<div>
				<input
					readonly
					name="deja_faites"
					type="number"
					min="0"
					max="365"
					bind:value={deja_faites}
					class="input group-[.has-error]/field:border-error-500" />
			</div>
			<p class="text-surface-800 dark:text-surface-100">
				{@html $t('form.generateur', 'alredaydone.help')}
			</p>
		</label>
 -->
		<SubmitButton />
	</FormWrapper>
</div>
