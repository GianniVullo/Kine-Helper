<script>
	import { FormWrapper, SubmitButton, DateField, NumberField, TextFieldV2 } from '../index';
	import { SlideToggle, getToastStore, getModalStore } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import { errorToast } from '$lib/ui/toasts';
	import { get } from 'svelte/store';
	import CheckboxFieldV2 from '../abstract-fields/CheckboxFieldV2.svelte';
	import SeancesField from './SeancesField.svelte';
	import { patients } from '$lib/stores/PatientStore';

	export let donnees;
	export let padding;
	export let codeMap;

	export let updateState;

	const toastStore = getToastStore();
	const modalStore = getModalStore(); // pour le code modal

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
			label="Porte la prescription" />
		<CheckboxFieldV2
			bind:value={donnees.has_been_printed}
			name={`${padding}has_been_printed`}
			label="Imprimer tout de suite" />
		<div class="flex flex-col border-l-2 border-l-error-500 pl-2">
			{#if codeMap.is_lieu3()}
				<CheckboxFieldV2
					readOnly
					bind:value={donnees.with_indemnity}
					name={`${padding}with_indemnity`}
					on:change={updateState}
					label="Avec indemnité" />
			{/if}
			{#if codeMap.groupes_has_intake()}
				<CheckboxFieldV2
					readOnly
					bind:value={donnees.with_intake}
					name={`${padding}with_intake`}
					on:change={updateState}
					label="Avec Intake" />
			{/if}
			{#if codeMap.groupes_has_rapport()}
				<CheckboxFieldV2
					readOnly
					bind:value={donnees.with_rapport}
					name={`${padding}with_rapport`}
					on:change={updateState}
					label="Avec rapport" />
			{/if}
			<p class="text-surface-400">
				Ces valeurs ne sont là qu'à titre informatif, veuillez les modifier dans le formulaire "<a
					class="text-primary-500 hover:underline dark:text-primary-400"
					href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/update`}
					>situation pathologique</a
				>"
			</p>
		</div>
		<DateField label="Date de l'attestation" bind:value={donnees.date} name={`${padding}date`} />
		<NumberField bind:value={donnees.total_recu} name={`${padding}total_recu`} label="Total reçu" />
		<NumberField
			bind:value={donnees.valeur_totale}
			name={`${padding}valeur_totale`}
			label="Valeur totale" />
		<TextFieldV2
			bind:value={donnees.numero_etablissment}
			name={`${padding}numero_etablissment`}
			label="Numéro d'établissement" />
		<TextFieldV2 bind:value={donnees.service} name={`${padding}service`} label="Service" />
		<h4>Les séances</h4>
		<SeancesField seances={donnees.seances} />
		<div class="font-semibold">{message}</div>
	</div>
</div>
