<script>
	import { groupes, lieux, types, lieuxParGroupe, durees } from '../../../stores/codeDetails';
	import CheckboxFieldV2 from '../../abstract-fields/CheckboxFieldV2.svelte';
	import FieldWithPopup from '../../abstract-fields/FieldWithPopup.svelte';
	import RadioFieldV2 from '../../abstract-fields/RadioFieldV2.svelte';
	import SelectFieldV2 from '../../abstract-fields/SelectFieldV2.svelte';
	import { patholourdeTypes } from '../../../stores/codeDetails';

	export let codeActif;
	export let onChangeCallback;

	let code = {
		groupe_id: codeActif.groupe_id.toString(),
		lieu_id: codeActif.lieu_id.toString(),
		type: codeActif.type_id.toString(),
		lourde_type: codeActif.lourde_type_id?.toString(),
		amb_hos: codeActif.amb_hos,
		duree: codeActif.duree_id?.toString(),
		drainage: codeActif.drainage
	};

	let disabled = false;

	$: {
		disabled = true;
		onChangeCallback(code).then(() => {
			disabled = false;
		});
	}

	let options = patholourdeTypes().map((value, index) => ({ label: value, value: `${index}` }));
	let typesOptions = types().map((value, index) => ({ label: value, value: `${index}` }));
	let groupOptions = groupes().map((value, index) => ({
		label: value,
		value: `${index}`,
		id: `group${index}`
	}));
	let lieuOptions = lieux().map((value, index) => ({
		label: value,
		value: `${index}`,
		id: `lieu${index}`
	}));

	let dureesOptions = durees().map((value, index) => ({
		label: value,
		value: `${index}`,
		id: `duree${index}`
	}));
</script>

<div class:pointer-events-none={disabled} class="space-y-2">
	<SelectFieldV2
		name="groupe"
		bind:value={code.groupe_id}
		options={groupOptions}
		placeholder="Choisir un groupe pathologique"
		label="Groupe pathologique"
		required />
	<SelectFieldV2
		name="lieu"
		bind:value={code.lieu_id}
		options={lieuOptions}
		placeholder="Choisir un lieu"
		label="Lieu de la séance"
		required />
	<SelectFieldV2
		name="duree"
		bind:value={code.duree}
		options={dureesOptions}
		placeholder="Choisir une durée"
		label="Durée de la séance" />
	{#if code.groupe_id === 1}
		<!--? Pathologie Lourde -->
		<RadioFieldV2
			{options}
			bind:value={code.lourde_type}
			name="pathologieLourdeCode"
			label="Pathologie lourde" />
	{/if}
	<SelectFieldV2
		name="type"
		bind:value={code.type}
		options={typesOptions}
		placeholder="Choisir un type"
		label="Type du code" />

	<RadioFieldV2
		name="Amb_hos"
		bind:value={code.amb_hos}
		options={[
			{ value: 'AMB', label: 'AMB' },
			{ value: 'HOS', label: 'HOS' }
		]}
		inline
		label="Ambulatoire ou Hospitalisé ?" />
	<!--? Fb -->
	{#if parseInt(code.groupe_id) == 5}
		<FieldWithPopup target="drainage">
			<span slot="content"
				>Uniquement pour les pathologies du "volet H) Lymphoedème".<br />Le générateur utilisera les
				codes 639xxx.</span>
			<div class="flex flex-col">
				<CheckboxFieldV2 name="drainage" label="Code drainage" bind:value={code.drainage} />
			</div>
		</FieldWithPopup>
	{/if}
</div>
