<script>
	import { DateField, NumberField, TextFieldV2 } from '../index';
	import { page } from '$app/stores';
	import CheckboxFieldV2 from '../abstract-fields/CheckboxFieldV2.svelte';
	import SeancesField from './SeancesField.svelte';
	import { patients } from '$lib/stores/PatientStore';
	import { t } from '../../i18n';

	export let donnees;
	export let padding;
	export let codeMap;

	export let updateState;

	let message = '';
	let patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	let sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
	//! prescription_id
	console.log('donnees', donnees);
</script>

<div class="flex min-w-[30vw] flex-col">
	<div class="max-w-md space-y-4">
		<CheckboxFieldV2
			bind:value={donnees.porte_prescr}
			name={`${padding}porte_prescr`}
			label={$t('attestation.detail', 'porte_prescr')} />
		<CheckboxFieldV2
			bind:value={donnees.has_been_printed}
			name={`${padding}has_been_printed`}
			label={$t('attestation.create', 'printNow')} />
		<div class="flex flex-col border-l-2 border-l-error-500 pl-2">
			{#if codeMap.is_lieu3()}
				<CheckboxFieldV2
					readOnly
					bind:value={donnees.with_indemnity}
					name={`${padding}with_indemnity`}
					on:change={updateState}
					label={$t('sp.update', 'label.with_indemnity')} />
			{/if}
			{#if codeMap.groupes_has_intake()}
				<CheckboxFieldV2
					readOnly
					bind:value={donnees.with_intake}
					name={`${padding}with_intake`}
					on:change={updateState}
					label={`${$t('shared', 'with')} Intake`} />
			{/if}
			{#if codeMap.groupes_has_rapport()}
				<CheckboxFieldV2
					readOnly
					bind:value={donnees.with_rapport}
					name={`${padding}with_rapport`}
					on:change={updateState}
					label={$t('attestation.form', 'with_rapport')} />
			{/if}
			<p class="text-surface-400">
				{$t('attestation.form', 'help')} "<a
					class="text-primary-500 hover:underline dark:text-primary-400"
					href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/update`}
					>{$t('shared', 'pathologicalSituation')}</a
				>"
			</p>
		</div>
		<DateField
			label={$t('attestation.form', 'label.date')}
			bind:value={donnees.date}
			name={`${padding}date`} />
		<NumberField bind:value={donnees.total_recu} name={`${padding}total_recu`} label={
			$t('attestation.detail', 'total_recu')
		}/>
		<NumberField
			bind:value={donnees.valeur_totale}
			name={`${padding}valeur_totale`}
			label={$t('attestation.detail', 'valeur_totale')} />
		<TextFieldV2
			bind:value={donnees.numero_etablissment}
			name={`${padding}numero_etablissment`}
			label={$t('sp.update', 'label.numero_etablissment')} />
		<TextFieldV2 bind:value={donnees.service} name={`${padding}service`} label={$t('sp.update', 'label.service')} />
		<h4>{$t('patients.detail', 'prestations')}</h4>
		<SeancesField seances={donnees.seances} />
		<div class="font-semibold">{message}</div>
	</div>
</div>
