<script>
	/**
	 ** Ici l'utilisateur doi pouvoir choisir parmis les tarifs qu'il a définit dans le module finance ou bien définir un nouveau tarif custom qui sera présent uniquement dans les metadatas de la sp.
	 */
	import DefaultTarifFieldWithEventListener from './DefaultTarifFieldWithEventListener.svelte';

	let {
		form = $bindable(),
		errors,
		indemnite,
		consultatif,
		seance,
		seconde_seance,
		rapport,
		intake,
		tarifs,
		all = false
	} = $props();

	console.log('in tarif field', form);

	const options = tarifs.map((s) => ({
		label: `${s.nom} - ${s.valeur}€`,
		value: s.id,
		id: s.id
	}));
</script>

{#if seance || all}
	<DefaultTarifFieldWithEventListener
		bind:formField={form.tarif_seance_custom}
		{errors}
		id="tarif_seance"
		name="tarif_seance"
		label="Séances de kinésithérapie"
		label2="Tarifs disponibles"
		{tarifs}
		bind:value={form.tarif_seance}
		{options} />
{/if}
{#if indemnite || all}
	<DefaultTarifFieldWithEventListener
		bind:formField={form.tarif_indemnite_custom}
		{errors}
		id="tarif_indemnite"
		name="tarif_indemnite"
		label="Indemnités de déplacment"
		label2="Tarifs disponibles"
		{tarifs}
		bind:value={form.tarif_indemnite}
		{options} />
{/if}
{#if rapport || all}
	<DefaultTarifFieldWithEventListener
		bind:formField={form.tarif_rapport_ecrit_custom}
		{errors}
		id="tarif_rapport_ecrit"
		name="tarif_rapport_ecrit"
		label="Rapports écrits"
		label2="Tarifs disponibles"
		{tarifs}
		bind:value={form.tarif_rapport_ecrit}
		{options} />
{/if}
{#if consultatif || all}
	<DefaultTarifFieldWithEventListener
		bind:formField={form.tarif_consultatif_custom}
		{errors}
		id="tarif_consultatif"
		name="tarif_consultatif"
		label="Séances à titre consultatif"
		label2="Tarifs disponibles"
		{tarifs}
		bind:value={form.tarif_consultatif}
		{options} />
{/if}
{#if seconde_seance || all}
	<DefaultTarifFieldWithEventListener
		bind:formField={form.tarif_seconde_seance_custom}
		{errors}
		id="tarif_seconde_seance"
		name="tarif_seconde_seance"
		label="Secondes séances/jour"
		label2="Tarifs disponibles"
		{tarifs}
		bind:value={form.tarif_seconde_seance}
		{options} />
{/if}
{#if intake || all}
	<DefaultTarifFieldWithEventListener
		bind:formField={form.tarif_intake_custom}
		{errors}
		id="tarif_intake"
		name="tarif_intake"
		label="Intakes"
		label2="Tarif de votre intake"
		{tarifs}
		bind:value={form.tarif_intake}
		{options} />
{/if}
