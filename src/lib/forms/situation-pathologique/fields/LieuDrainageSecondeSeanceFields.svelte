<script>
	import { SelectField, CheckboxField, RadioField } from '../../index';
	import { lieux, lieuxParGroupe } from '../../../stores/codeDetails';
	import WarningDisplayer from '../ui/WarningDisplayer.svelte';

	export let group;

	let lieu = 'none';

	let lieuOptions;
	// Ici il est nécessaire de filtrer les lieux en fonction du groupe sélectionné ici ça peut être un computed pour pouvoir tenir la variation de groupe
	$: lieuOptions = lieux
		.map((val, index) => {
			let groupSchema = lieuxParGroupe[parseInt(group)];
			if (groupSchema === '*') {
				console.log(
					`In lieuOptions with groupSchema == ${groupSchema}, value from mapfn == ${val}`
				);
				return { label: val, value: index, id: `lieu${index}` };
			}
			if (groupSchema.includes(index)) {
				return { label: val, value: index, id: `lieu${index}` };
			}
		})
		.filter((val) => val);
</script>

<SelectField
	options={lieuOptions}
	value="none"
	required
	name="lieu"
	onChangeHandler={(event) => {
		lieu = event.target.value;
	}}
	label="lieu par séance"
	placeholder="Choisir un lieu" />

{#if parseInt(group) == 5}
	<CheckboxField name="drainage" label="J'effectue un drainage" />
{/if}

{#if parseInt(lieu) == 7}
	<RadioField
		value="AMB"
		options={[
			{ value: 'AMB', label: 'AMB' },
			{ value: 'HOS', label: 'HOS' }
		]}
		inline
		label="Ambulatoire ou Hospitalisé ?" />
{/if}

{#if parseInt(lieu) == 6 && parseInt(group) == 0}
	<RadioField
		value="0"
		options={[
			{ value: "0", label: '15 min.' },
			{ value: "2", label: '30 min.' }
		]}
		inline
		label="Durée de la séance ?" />
{/if}
{#if parseInt(group) == 6}
	Fa ? aussi ? Fb ?
	<CheckboxField name="secondeSeance" label="Générer une seconde séance par jour*" />
	<WarningDisplayer
		descriptionLines={[
			'La prescription doit explicitement autoriser une seconde séance par jour.'
		]} />
{/if}

<!--! Quoi à propos de palliatifs à domicile ? N'y avait-il pas une histoire de Seconde séance ? -->

<!--! Pareil pour la Fa ... Y'avait une histoire de Seconde séances non ? genre 14 dans les 30 jours ? -->
