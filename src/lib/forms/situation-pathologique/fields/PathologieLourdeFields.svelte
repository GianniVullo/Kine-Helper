<script>
	import { RadioFieldV2, CheckboxFieldV2 } from '../../index';
	import GMFCSScoreField from './GMFCSScoreField.svelte';
	import WarningDisplayer from '../ui/WarningDisplayer.svelte';

	const patholourdeTypes = [
		'Séance normale (20 ou 30 minutes)',
		'Patient IMC (60 min)',
		'Drainage 60 min',
		'Drainage 120 min',
		'Séance de 45 min après le séjour du bénéficiaire en hôpital ou en centre de revalidation (phase subaiguë). Pour les volets a), c) ou d) uniquement',
		'Séance de 60 min au global avec minimum 2 périodes distinctes<br>Pour le volet j) uniquement'
	];

	let options = patholourdeTypes.map((value, index) => ({ label: value, value: index }));

	export let pathologieLourde = undefined;
	export let GMFCSScore;
	export let secondeSeance = false;
</script>

<div class="max-w-sm">
	<RadioFieldV2
		{options}
		bind:value={pathologieLourde}
		name="pathologieLourdeCode"
		label="Pathologie lourde" />
</div>

{#if pathologieLourde == '1'}
	<GMFCSScoreField bind:value={GMFCSScore} />
	<WarningDisplayer
		descriptionLines={[
			'Si le patient est dans sa 21eme années il faut envoyer une notification au medecin conseil avec le GMFCS du patient.',
			"À compter de l'année de ses 22 ans le score GMFCS déterminera le nombre de séances auquels le patient aura droit.",
			'4 ou 5 : 200 séances, 2 ou 3 : 150 séances, 1 : 100 séances.',
			'Une demande pour 50 séances justifiées supplémentaires pourra être introduite auprès du médecin conseil.',
			'Ne peuvent pas être cumulée avec une seconde séance par jour.'
		]} />
{:else if ['2', '3'].includes(pathologieLourde)}
	<WarningDisplayer
		descriptionLines={['Ne peuvent pas être cumulée avec une seconde séance par jour.']} />
{:else if pathologieLourde == '4'}
	<WarningDisplayer
		descriptionLines={[
			"La nécessité d'effectuer des séances de 45 minutes doit être mentionné sur la prescription émise par un médecin porteur de la qualification de médecin spécialiste en médecine physique et revalidation et/ou porteur de la qualification de spécialiste en réadaptation fonctionnelle et professionnelle pour handicapés.",
			'Ne peuvent pas être cumulée avec une seconde séance par jour.'
		]} />
{:else if pathologieLourde == '5'}
	<WarningDisplayer
		descriptionLines={[
			'30 fois par années civiles maximums avec un maximum de 10 séances effectuées par prescription',
			'Doivent être séparées de 3h au moins',
			'Ne peuvent pas être cumulée avec une seconde séance par jour.'
		]} />
{/if}

{#if pathologieLourde == '0'}
	<CheckboxFieldV2 bind:value={secondeSeance} name="secondeSeance" label="Générer une seconde séance par jour*" />
	<WarningDisplayer
		descriptionLines={[
			'La prescription doit explicitement autoriser une seconde séance par jour.'
		]} />
{/if}
