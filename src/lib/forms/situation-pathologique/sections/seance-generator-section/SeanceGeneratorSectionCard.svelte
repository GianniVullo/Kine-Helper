<script>
	import {
		SectionCard,
		TextField,
		FieldWithPopup,
		CheckboxesSetField,
		SelectField
	} from '../../../index';
	import {maxLegalNumberSeance} from './legalNumberSeance'
	import { daysOfWeek } from '../../../../stores/dateHelpers';
	import { groupes } from '../../../../stores/codeDetails';
	import PathologieLourdeFields from '../../fields/PathologieLourdeFields.svelte';
	import LieuDrainageSecondeSeanceFields from '../../fields/LieuDrainageSecondeSeanceFields.svelte';

	let groupOptions = groupes
		.map((value, index) => {
			if ([0, 1, 3, 4, 5, 6, 7].includes(index)) {
				return { label: value, value: `${index}`, id: `group${index}` };
			}
		})
		.filter((value) => value);

	let group = 'none';

	let day_of_weekOptions = daysOfWeek.map((value, index) => {
		return {
			id: value.substring(0, 2),
			label: value,
			name: 'day_of_week',
			value: index == 6 ? '0' : `${index + 1}`
		};
	});
	// $: maxLegalSeances = maxLegalNumberSeance[group];
</script>

<div class="flex w-full flex-col">
	<h3 class="w-full text-lg text-surface-500">Générateur de traitement</h3>
	<div class="flex w-full md:space-x-4 lg:space-x-12">
		<!--* PARTIE CODE DEFINITION  -->
		<SectionCard label="Définir les codes">
			<SelectField
				options={groupOptions}
				required
				name="groupe"
				value={group}
				onChangeHandler={(event) => group = event.target.value}
				label="Groupe pathologique"
				placeholder="Choisir un groupe pathologique" />

			{#if parseInt(group) == 1}
				<PathologieLourdeFields />
			{:else if group != 'none'}
				{#key group}
					<LieuDrainageSecondeSeanceFields {group} />
				{/key}
			{:else}
				<p>Veuillez d'abord choisir un groupe svp</p>
			{/if}
		</SectionCard>

		<!--* PARTIE NUMBER DEFINITION -->
		<SectionCard label="Définir le nombre">
			<FieldWithPopup target="dejaFaitePopUp" placement="top">
				<span slot="content">
					Ici, vous pourrez indiquer les sessions éventuellement déjà effectuées par un.e collègue
				</span>
				<TextField
					name="deja_faites"
					parentClass="w-11/12"
					value="0"
					type="number"
					required
					placeholder="Séances déjà effectuées"
					label="Séances déjà effectuées" />
			</FieldWithPopup>
			<TextField
				name="seance_per_week"
				type="number"
				value=""
				required
				placeholder="... Que vous allez effectuer"
				label="Nombre de séances par semaine" />
		</SectionCard>

		<!--* PARTIE DATE DEFINITION -->
		<SectionCard label="Définir les dates">
			<!--! Nan ça va pas ... Il faut mettre les heures en plus -->
			<CheckboxesSetField
				name="day_of_week"
				parentClass="flex-col"
				labelClass="flex"
				options={day_of_weekOptions} />
		</SectionCard>
	</div>
</div>
