<script>
	import { includes } from 'valibot';
	import { appState } from '../../../../managers/AppState.svelte';
	import SimpleSelect from '../fields/SimpleSelect.svelte';

	let { form = $bindable(), errors } = $props();

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
	<div class="col-span-3">
		<SimpleSelect
			label="Tarif de votre séance de kinésithérapie"
			bind:value={form.tarif_seance}
			options={tarifs} />
	</div>
	<div class="col-span-3">
		<SimpleSelect
			label="Tarif de votre indémnité de déplacement"
			bind:value={form.tarif_indemnite_dplcmt}
			options={tarifs} />
	</div>
	<div class="col-span-3">
		<SimpleSelect
			label="Tarif de votre rapport écrit"
			bind:value={form.tarif_rapport_ecrit}
			options={tarifs} />
	</div>
	<div class="col-span-3">
		<SimpleSelect
			label="Tarif de votre séance à titre consultatif"
			bind:value={form.tarif_consultatif}
			options={tarifs} />
	</div>
	<div class="col-span-3">
		<SimpleSelect
			label="Tarif de votre seconde séance par jour"
			bind:value={form.tarif_seconde_seance}
			options={tarifs} />
	</div>
	<div class="col-span-3">
		<SimpleSelect label="Tarif de votre intake" bind:value={form.tarif_intake} options={tarifs} />
	</div>
{:catch error}
	<!-- options was rejected -->
	{error}
{/await}
