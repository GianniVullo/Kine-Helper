<script>
	import { appState } from '../../../../managers/AppState.svelte';
	import MultipleSelect from '../fields/MultipleSelect.svelte';

	let { form = $bindable(), errors } = $props();

	const options = new Promise(async (resolve, reject) => {
		const { data, error } = await appState.db.select(
			'SELECT * FROM supplements WHERE user_id = $1',
			[appState.user.id]
		);

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
{:then supplements}
	<!-- options was fulfilled -->
	<div class="col-span-full">
		<MultipleSelect label="Suppléments" bind:value={form.supplements} options={supplements} help="cmd+click pour ajouter et enlever un supplément" />
	</div>
{:catch error}
	<!-- options was rejected -->
	{error}
{/await}
