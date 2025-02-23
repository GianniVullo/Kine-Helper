<script>
	import { appState } from '../../../../managers/AppState.svelte';
	import MultipleSelect from '../fields/MultipleSelect.svelte';

	let { value = $bindable(), errors } = $props();

	const options = new Promise(async (resolve, reject) => {
		const { data, error } = await appState.db.select(
			'SELECT * FROM supplements WHERE user_id = $1',
			[appState.user.id]
		);
		if (error) {
			console.log('In error');

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
		<MultipleSelect
			label="Suppléments"
			bind:value
			options={supplements}
			help="cmd+click pour ajouter ou enlever un supplément" />
	</div>
{:catch error}
	{console.log('In the error rendering')}
	<!-- options was rejected -->
	{error}
{/await}
