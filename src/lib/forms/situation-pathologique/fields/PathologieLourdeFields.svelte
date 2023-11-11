<script>
	import { RadioField, CheckboxField } from '../../index';
	import { patholourdeTypes } from '../../../stores/codeDetails';
	import GMFCSScoreField from './GMFCSScoreField.svelte';
	import WarningDisplayer from '../ui/WarningDisplayer.svelte';

	let options = patholourdeTypes.map((value, index) => ({ label: value, value: index }));

	let pathologieLourde = undefined;
	function test(event) {
		pathologieLourde = event.target.value;
		console.log('in test event Radiogroup with', event);
	}
</script>

<RadioField
	{options}
	onChangeHandler={test}
	name="pathologieLourdeCode"
	label="Pathologie lourde" />

{#if pathologieLourde == '2'}
	<GMFCSScoreField />
{/if}
{#if pathologieLourde == '2'}
	<WarningDisplayer
		descriptionLines={[
			'Si le patient est dans sa 21eme années il faut envoyer une notification au medecin conseil avec le GMFCS du patient.',
			"À compter de l'année de ses 22 ans le score GMFCS déterminera le nombre de séances auquels le patient aura droit.",
			'4 ou 5 : 200 séances, 2 ou 3 : 150 séances, 1 : 100 séances.',
			'Une demande pour 50 séances justifiées supplémentaires pourra être introduite auprès du médecin conseil.',
			'Ne peuvent pas être cumulée avec une seconde séance par jour.'
		]} />
{:else if pathologieLourde == '3' || pathologieLourde == '4'}
	<WarningDisplayer
		descriptionLines={['Ne peuvent pas être cumulée avec une seconde séance par jour.']} />
{:else if pathologieLourde == '5'}
	<WarningDisplayer
		descriptionLines={[
			"La nécessité d'effectuer des séances de 45 minutes doit être mentionné sur la prescription émise par un médecin porteur de la qualification de médecin spécialiste en médecine physique et revalidation et/ou porteur de la qualification de spécialiste en réadaptation fonctionnelle et professionnelle pour handicapés.",
			'Ne peuvent pas être cumulée avec une seconde séance par jour.'
		]} />
{:else if pathologieLourde == '6'}
	<WarningDisplayer
		descriptionLines={[
			'30 fois par années civiles maximums avec un maximum de 10 séances effectuées par prescription',
			'Doivent être séparées de 3h au moins',
			'Ne peuvent pas être cumulée avec une seconde séance par jour.'
		]} />
{/if}

{#if ['0', '1'].includes(pathologieLourde)}
	<CheckboxField name="secondeSeance" label="Générer une seconde séance par jour*" />
	<WarningDisplayer
		descriptionLines={[
			'La prescription doit explicitement autoriser une seconde séance par jour.'
		]} />
{/if}
