<script>
	import { appState } from '$lib/managers/AppState.svelte';
	import Database from '@tauri-apps/plugin-sql';
	import { supabase } from '$lib/stores/supabaseClient';
	import dayjs from 'dayjs';

	let isMigrating = $state(false);
	let migrationComplete = $state(false);
	let logs = $state([]);

	async function performMigration() {
		isMigrating = true;

		await new Promise(async (resolve) => resolve(await migrateLocalToSupabase()));

		isMigrating = false;
		migrationComplete = true;
	}

	async function migrateLocalToSupabase() {
		const tables = [
			'patients',
			'situations_pathologiques',
			'accords',
			'prescriptions',
			'attestations',
			'seances',
			'factures',
			'factures_attestations'
		];
		const localDb = await Database.load('sqlite:khbackup.db');

		for (const table of tables) {
			logs.push(`TREATING atble : , ${table}, ${appState.user.id}`);

			let localData;
			if (table == 'factures_attestations') {
				localData = await localDb.select(`SELECT * FROM ${table}`);
			} else {
				localData = await localDb.select(`SELECT * FROM ${table} WHERE user_id = $1`, [
					appState.user.id
				]);
			}
			logs.push(`table row length ${localData.length}`);

			switch (table) {
				case 'attestations':
					localData = localData.map((a) => {
						a.valeur_totale = parseFloat(a.valeur_totale);
						a.total_recu = parseFloat(a.valeur_totale);
						return a;
					});
					break;
				case 'seances':
					localData = localData.map((a) => {
						const fmt = (k) => {
							a[k] = dayjs(a[k]).format('HH:mm:ss');
							if (a[k].toLowerCase() === 'invalid date') {
								a[k] = null;
							}
						};
						if (a.start) {
							fmt('start');
						}
						if (a.end) {
							fmt('end');
						}
						return a;
					});
					break;

				default:
					break;
			}

			if (localData.length > 0) {
				logs.push(`Table = ${table} and data = ${localData}`);

				logs.push(`${localData.length}`);
				const { error: deleteError } = await supabase
					.from(table)
					.delete()
					.in(
						'user_id',
						localData.map((a) => a.user_id)
					);
				const { error } = await supabase.from(table).upsert(
					localData.map((lD) => ({
						...removeEmptyProps(lD),
						organization_id: 'fa472582-45e2-4f66-916a-78328613bc3a',
						user_id: appState.user.id
					}))
				);
				if (error) logs.push(`Error migrating ${table}: ${error.message}`);
				logs.push(`✓ Migrated ${localData.length} from ${table}`);
			}
		}

		return true;
	}
	function removeEmptyProps(data) {
		if (Array.isArray(data)) {
			return data.map((item) => removeEmptyProps(item));
		}

		return Object.entries(data).reduce((acc, [key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				acc[key] = value;
			}
			return acc;
		}, {});
	}

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<div
	class="flex flex-col items-center gap-4 rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
	<h2 class="text-xl font-semibold text-amber-900">Migration de données</h2>

	<p class="max-w-md text-sm text-amber-800">
		Une ancienne base de données a été détectée. Cliquez sur le bouton ci-dessous pour transférer
		vos données vers la nouvelle version de Kiné Helper.
	</p>

	{#if migrationComplete}
		<div class="flex items-center gap-2 text-green-700">
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
			<span class="font-medium">Migration terminée avec succès !</span>
		</div>
	{:else}
		<button
			onclick={performMigration}
			disabled={isMigrating}
			class="rounded-md bg-amber-600 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50">
			{#if isMigrating}
				Migration en cours...
			{:else}
				Effectuer la migration
			{/if}
		</button>
	{/if}

	<ul
		class="mt-4 max-h-48 overflow-y-auto rounded bg-gray-900 p-3 font-mono text-xs text-green-400">
		{#each logs as log}
			<li>{log}</li>
		{/each}
	</ul>
</div>
