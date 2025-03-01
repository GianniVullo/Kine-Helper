<script>
	import {
		dureeParGroupeParLieu,
		durees,
		groupes
	} from '../../../../stores/codeDetails';
	import SimpleSelect from '../fields/SimpleSelect.svelte';
	import { get } from 'svelte/store';
	import { t } from '../../../../i18n';
	import { untrack } from 'svelte';
	import RadioFieldV2 from '../../../../forms/abstract-fields/RadioFieldV2.svelte';
	import PathologieLourdeFields from '../situation-pathologique/PathologieLourdeFields.svelte';

	let { form = $bindable(), lieuOptions, errors, groupeOptions } = $props();

	let dureeOptions = $state();

	const checkIfDuree = (index) => {
		const dureeParGroupeParLieuDuGroupeAChecker = dureeParGroupeParLieu[form.groupe_id];

		if (dureeParGroupeParLieuDuGroupeAChecker) {
			for (const [repartitionParLieux, durees] of Object.entries(
				dureeParGroupeParLieuDuGroupeAChecker
			)) {
				let parsedRepartition = repartitionParLieux.split(',').map((s) => parseInt(s));
				if (parsedRepartition?.includes(form.lieu_id) && durees.includes(index)) {
					return true;
				}
			}
		}
	};
	console.log('In NomenclatureDefinerFields', form);
	$effect(() => {
		form.lieu_id;
		untrack(
			() =>
				(dureeOptions = durees()
					.map((d, index) => ({ label: d, value: index }))
					.filter((s, index) => {
						const ceck = checkIfDuree(index);
						return ceck;
					})
					.map(({ label, value }, index) => ({
						label,
						value,
						id: `duree${index}`
					})))
		);
		if (lieuOptions.length === 1) {
			untrack(() => (form.lieu_id = lieuOptions[0].value));
		}
		const dO = untrack(() => dureeOptions);
		if (dO.length === 1) {
			untrack(() => (form.duree = dO[0].value));
		}
	});
</script>

<div class="col-span-full md:col-span-4">
	<SimpleSelect
		label={get(t)('form.generateur', 'group.label')}
		name="groupe_id"
		bind:value={form.groupe_id}
		options={groupeOptions}
		placeholder={get(t)('form.generateur', 'group.placeholder')} />
	{#if errors.groupe_id}
		<p class="mt-2 text-sm text-red-600" id="groupe_id-error">
			{@html errors.groupe_id}
		</p>
	{/if}
</div>

<!--? LIEUX ID -->
{#if typeof form.groupe_id == 'number'}
	<div class="col-span-full md:col-span-4">
		<SimpleSelect
			label={get(t)('form.generateur', 'lieu.label')}
			name="lieu_id"
			bind:value={form.lieu_id}
			options={lieuOptions}
			placeholder={get(t)('form.generateur', 'lieu.placeholder')} />
		{#if errors.lieu_id}
			<p class="mt-2 text-sm text-red-600" id="lieu_id-error">
				{@html errors.lieu_id}
			</p>
		{/if}
	</div>
{/if}

<!--? PATHOLOURDE TYPE -->
{#if typeof form.groupe_id == 'number' && form.groupe_id === 1}
	<div class="col-span-full md:col-span-4">
		<PathologieLourdeFields
			bind:pathologieLourde={form.patho_lourde_type}
			bind:gmfcs={form.gmfcs}
			{errors} />
	</div>
{/if}
<!--? DURÉE ID -->
{#if typeof form.groupe_id == 'number' && typeof form.lieu_id == 'number' && form.groupe_id !== 1}
	<div class="col-span-full md:col-span-4">
		<SimpleSelect
			label={$t('form.generateur', 'duree.label')}
			name="duree"
			bind:value={form.duree}
			options={dureeOptions}
			placeholder="Choisissez une durée" />
		{#if errors.duree}
			<p class="mt-2 text-sm text-red-600" id="duree-error">
				{@html errors.duree}
			</p>
		{/if}
	</div>
{/if}

<!--? Permet une seconde séance par jour -->
<!--! cette histoire de seconde séance/jour le kiné doit savoi. kiné helper n'a pas besoin de cette innfo -->

<!--? AMB/HOS (if lieu 5) -->
{#if typeof form.groupe_id == 'number' && typeof form.lieu_id == 'number' && form.lieu_id === 7}
	<div class="col-span-full">
		<RadioFieldV2
			name="Amb_hos"
			bind:value={form.amb_hos}
			options={[
				{ value: 'AMB', label: 'AMB' },
				{ value: 'HOS', label: 'HOS' }
			]}
			inline
			label={$t('form.generateur', 'amb_hos')} />
		{#if errors.amb_hos}
			<p class="mt-2 text-sm text-red-600" id="amb_hos-error">
				{@html errors.amb_hos}
			</p>
		{/if}
	</div>
{/if}
