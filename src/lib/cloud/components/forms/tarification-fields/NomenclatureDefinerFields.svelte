<script>
	import { dureeParGroupeParLieu, durees, groupes } from '../../../../stores/codeDetails';
	import SimpleSelect from '../fields/SimpleSelect.svelte';
	import { get } from 'svelte/store';
	import { t } from '../../../../i18n';
	import { untrack } from 'svelte';
	import RadioFieldV2 from '../../../../forms/abstract-fields/RadioFieldV2.svelte';
	import PathologieLourdeFields from '../situation-pathologique/PathologieLourdeFields.svelte';
	import Field from '../abstract-components/Field.svelte';

	let { form = $bindable(), lieuOptions, errors, groupeOptions, readonly } = $props();

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
		form.patho_lourde_type;
		untrack(() => {
			dureeOptions = durees()
				.map((d, index) => ({ label: d, value: index }))
				.filter((s, index) => {
					const ceck = checkIfDuree(index);
					return ceck;
				})
				.map(({ label, value }, index) => ({
					label,
					value,
					id: `duree${index}`
				}));
			console.log('dureeOptions', dureeOptions);

			if (lieuOptions.length === 1) {
				form.lieu_id = lieuOptions[0].value;
			}
			const dO = dureeOptions;
			if (dO.length === 1) {
				form.duree = dO[0].value;
			}
		});
		// change duree_id for patho lourde
		if (form.groupe_id === 1) {
			console.log('In $effect for patholourde setting durée', form);
			untrack(() => {
				switch (form.patho_lourde_type) {
					case 0:
						if ([4, 5, 8].includes(form.lieu_id)) {
							form.duree = 1;
						} else {
							form.duree = 2;
						}
						break;
					case 1 || 2:
						form.duree = 4;
						break;
					case 3:
						form.duree = 5;
						break;
					case 4:
						form.duree = 3;
						break;
					case 5:
						form.duree = 2;
						break;
				}
			});
			console.log('the duree now is', form.duree);
		}
	});
</script>

{#if readonly}
	<p class="col-span-full mt-2 text-sm text-red-900">
		Vous ne pouvez pas modifier les informations de nomenclature d'une sp contenant des séances déjà
		attestées
	</p>
{/if}
<div class="col-span-full md:col-span-4">
	<SimpleSelect
		{readonly}
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
			{readonly}
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
			{readonly}
			bind:pathologieLourde={form.patho_lourde_type}
			bind:gmfcs={form.gmfcs}
			{errors} />
	</div>
{/if}
<!--? DURÉE ID -->
{#if typeof form.groupe_id === 'number' && typeof form.lieu_id == 'number' && form.groupe_id !== 1}
	<div class="col-span-full md:col-span-4">
		<SimpleSelect
			label={'Durée'}
			name="duree"
			{readonly}
			bind:value={form.duree}
			options={dureeOptions}
			placeholder="Choisissez une durée" />
		{#if errors.duree}
			<p class="mt-2 text-sm text-red-600" id="duree-error">
				{@html errors.duree}
			</p>
		{/if}
		{#if form.groupe_id === 5}
			<p class="mt-2 text-sm text-gray-600">
				Sélectionnez 45 minutes si votre situation pathologique est un drainage. Attention, ce
				statut doit être validé par le médecin conseil.
			</p>
		{/if}
	</div>
{/if}

<!--? La durée de la seconde séance Fa -->
{#if typeof form.groupe_id === 'number' && form.groupe_id === 4}
	<div class="col-span-full md:col-span-4">
		<SimpleSelect
			label="Durée de la seconde séance"
			name="duree"
			{readonly}
			bind:value={form.duree_ss_fa}
			options={[
				{ label: "Je n'effectue pas de secondes séances", value: -1 },
				{ label: "J'effectue des secondes séances de 15 min", value: 0 },
				{ label: "J'effectue des secondes séances de 30 min", value: 3 }
			]}
			placeholder="Choisissez une durée" />
		{#if errors.duree}
			<p class="mt-2 text-sm text-red-600" id="duree-error">
				{@html errors.duree_ss_fa}
			</p>
		{/if}
	</div>

	<Field
		field={{
			id: 'volet_j',
			name: 'volet_j',
			inputType: 'checkbox',
			readonly,
			checkboxLabel: 'La pathologie est un volet <span class="italic">j) Polytraumatisé</span>',
			checkboxDescription:
				'Cochez cette case si la pathologie est un volet j) Polytraumatisé, cela donne accès à 120 séances.',
			outerCSS: 'sm:col-span-4',
			innerCSS: ''
		}}
		bind:value={form.volet_j} />
{/if}

<!--? AMB/HOS (if lieu 5) -->
{#if typeof form.groupe_id == 'number' && typeof form.lieu_id == 'number' && form.lieu_id === 7}
	<div class="col-span-full">
		<RadioFieldV2
			name="Amb_hos"
			readOnly={readonly}
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
