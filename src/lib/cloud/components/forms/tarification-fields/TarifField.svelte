<script>
	import { appState } from '../../../../managers/AppState.svelte';
	import SimpleSelect from '../fields/SimpleSelect.svelte';
	import MoneyField from './MoneyField.svelte';

	let {
		form = $bindable(),
		errors,
		indemnite,
		consultatif,
		seance,
		seconde_seance,
		rapport,
		intake,
		all = false
	} = $props();

	const options = new Promise(async (resolve, reject) => {
		const { data, error } = await appState.db.select('SELECT * FROM tarifs WHERE user_id = $1', [
			appState.user.id
		]);

		if (error) {
			reject(error);
		}
		resolve(
			data.map((s) => ({
				label: `${s.nom} - ${s.valeur}€`,
				value: s.id,
				id: s.id
			}))
		);
	});
</script>

{#await options}
	<!-- options is pending -->
	Chargement...
{:then tarifs}
	<!-- options was fulfilled -->
	{#if seance || all}
		<div
			class="col-span-full flex flex-col space-x-0 space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
			<MoneyField bind:formField={form.tarif_seance_custom} {errors} />
			<SimpleSelect
				label="Tarif de votre séance de kinésithérapie"
				bind:value={form.tarif_seance}
				options={tarifs} />
		</div>
	{/if}
	{#if indemnite || all}
		<div
			class="col-span-full flex flex-col space-x-0 space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
			<MoneyField bind:formField={form.tarif_indemnite_dplcmt_custom} {errors} />
			<SimpleSelect
				label="Tarif de votre indémnité de déplacement"
				bind:value={form.tarif_indemnite_dplcmt}
				options={tarifs} />
		</div>
	{/if}
	{#if rapport || all}
		<div
			class="col-span-full flex flex-col space-x-0 space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
			<MoneyField bind:formField={form.tarif_rapport_ecrit_custom} {errors} />
			<SimpleSelect
				label="Tarif de votre rapport écrit"
				bind:value={form.tarif_rapport_ecrit}
				options={tarifs} />
		</div>
	{/if}
	{#if consultatif || all}
		<div
			class="col-span-full flex flex-col space-x-0 space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
			<MoneyField bind:formField={form.tarif_consultatif_custom} {errors} />
			<SimpleSelect
				label="Tarif de votre séance à titre consultatif"
				bind:value={form.tarif_consultatif}
				options={tarifs} />
		</div>
	{/if}
	{#if seconde_seance || all}
		<div
			class="col-span-full flex flex-col space-x-0 space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
			<MoneyField bind:formField={form.tarif_seconde_seance_custom} {errors} />

			<SimpleSelect
				label="Tarif de votre seconde séance par jour"
				bind:value={form.tarif_seconde_seance}
				options={tarifs} />
		</div>
	{/if}
	{#if intake || all}
		<div
			class="col-span-full flex flex-col space-x-0 space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
			<MoneyField bind:formField={form.tarif_intake_custom} {errors} />
			<SimpleSelect label="Tarif de votre intake" bind:value={form.tarif_intake} options={tarifs} />
		</div>
	{/if}{:catch error}
	<!-- options was rejected -->
	{error}
{/await}
